const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// --- 1. Get all documents with robust filtering ---
exports.getDocuments = async (req, res) => {
  try {
    // Destructure userId from the query params
    const { category, departmentId, search, userId } = req.query;

    let whereClause = {};

    // 1. Employee Filter: If userId is provided, strictly limit to that user
    if (userId) {
      whereClause.userId = userId;
    }

    // 2. Department Filter: Only if not already restricted by userId
    if (departmentId && departmentId !== 'all') {
      whereClause.departmentId = departmentId;
    }

    // 3. Category Filter
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // 4. Search Filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { 
          user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          } 
        }
      ];
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        user: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true 
          } 
        },
        department: { 
          select: { 
            id: true, 
            name: true 
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedDocs = documents.map(doc => ({
      ...doc,
      user: doc.user ? {
        ...doc.user,
        name: `${doc.user.firstName} ${doc.user.lastName}`
      } : { name: "Unknown Employee" }
    }));

    res.status(200).json(formattedDocs || []);
    
  } catch (error) {
    console.error("❌ FETCH ERROR:", error);
    res.status(500).json({ error: "Error fetching documents" });
  }
};

// --- 2. Create a new document (with Multer file processing) ---
exports.createDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const { category, userId, departmentId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fallback: If departmentId isn't sent, try to find the user's department
    let finalDeptId = departmentId;
    if (!finalDeptId || finalDeptId === "") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      finalDeptId = user?.departmentId;
    }

    // If still no department, and your DB requires it, you must throw a cleaner error
    if (!finalDeptId) {
      return res.status(400).json({ error: "Employee must be assigned to a department before uploading documents." });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const name = req.file.originalname;
    const size = (req.file.size / (1024 * 1024)).toFixed(2) + " MB";

    const document = await prisma.document.create({
      data: {
        name,
        fileUrl,
        category,
        size,
        userId,
        departmentId: finalDeptId
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } }
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("❌ CREATE ERROR:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
};

// --- 3. Update Document (Metadata and/or File) ---
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    // 1. Check if document exists
    const existingDoc = await prisma.document.findUnique({ where: { id } });
    if (!existingDoc) {
      return res.status(404).json({ error: "Document not found" });
    }

    let updateData = {
      name: name || existingDoc.name,
      category: category || existingDoc.category,
    };

    // 2. Handle File Replacement (if a new file was uploaded)
    if (req.file) {
      // Delete old file from disk
      const oldFilename = existingDoc.fileUrl.split('/').pop();
      const oldFilePath = path.join(__dirname, '../../uploads', oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Set new file details
      updateData.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      updateData.size = (req.file.size / (1024 * 1024)).toFixed(2) + " MB";
      // Use original name if user didn't provide a custom one
      if (!name) updateData.name = req.file.originalname;
    }

    // 3. Update Database
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } }
      }
    });

    // Format for frontend
    const formatted = {
      ...updatedDocument,
      user: { ...updatedDocument.user, name: `${updatedDocument.user.firstName} ${updatedDocument.user.lastName}` }
    };

    res.status(200).json(formatted);
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ error: "Error updating document" });
  }
};

// --- 4. Delete record AND physical file ---
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the document first to get the file path
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // 2. Extract filename from URL to delete from disk
    // fileUrl looks like: http://localhost:5000/uploads/12345-file.pdf
    const filename = doc.fileUrl.split('/').pop();
    const filePath = path.join(__dirname, '../../uploads', filename);

    // 3. Delete from Database
    await prisma.document.delete({ where: { id } });

    // 4. Delete physical file (Optional but recommended to save space)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ message: "Document and file deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    res.status(500).json({ error: "Error deleting document" });
  }
};