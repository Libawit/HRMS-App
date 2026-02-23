const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { cloudinary } = require('../config/cloudinary');

// --- 1. Get all documents ---
exports.getDocuments = async (req, res) => {
  try {
    const { category, departmentId, search, userId } = req.query;
    let whereClause = {};

    if (userId) whereClause.userId = userId;
    if (departmentId && departmentId !== 'all') whereClause.departmentId = departmentId;
    if (category && category !== 'all') whereClause.category = category;

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
        user: { select: { id: true, firstName: true, lastName: true } },
        department: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedDocs = documents.map(doc => ({
      ...doc,
      userName: doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : "Unknown Employee"
    }));

    res.status(200).json(formattedDocs);
  } catch (error) {
    console.error("❌ FETCH ERROR:", error);
    res.status(500).json({ error: "Error fetching documents" });
  }
};

// --- 2. Create a new document ---
exports.createDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const { category, userId, departmentId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    let finalDeptId = departmentId;
    if (!finalDeptId || finalDeptId === "" || finalDeptId === "null") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      finalDeptId = user?.departmentId;
    }

    if (!finalDeptId) {
      return res.status(400).json({ error: "Employee must be assigned to a department first." });
    }

    const document = await prisma.document.create({
      data: {
        name: req.file.originalname,
        fileUrl: req.file.path, // Secure HTTPS URL
        category: category || "General",
        size: (req.file.size / (1024 * 1024)).toFixed(2) + " MB",
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
    // If DB fails, attempt to delete the uploaded file from Cloudinary to stay clean
    if (req.file) {
       const publicId = req.file.filename; 
       await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    console.error("❌ CREATE ERROR:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
};

// --- 3. Update Document ---
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const existingDoc = await prisma.document.findUnique({ where: { id } });
    if (!existingDoc) return res.status(404).json({ error: "Document not found" });

    let updateData = {
      name: name || existingDoc.name,
      category: category || existingDoc.category,
    };

    if (req.file) {
      // DELETE OLD FILE (Public ID is usually 'folder/filename' in req.file.filename)
      if (existingDoc.fileUrl) {
          // Extracting ID from URL logic
          const publicId = existingDoc.fileUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`hrms_uploads/${publicId}`).catch(e => console.log("Old file delete skipped"));
      }

      updateData.fileUrl = req.file.path;
      updateData.size = (req.file.size / (1024 * 1024)).toFixed(2) + " MB";
      if (!name) updateData.name = req.file.originalname;
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } }
      }
    });

    res.status(200).json(updatedDocument);
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ error: "Error updating document" });
  }
};

// --- 4. Delete record ---
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) return res.status(404).json({ error: "Document not found" });

    // DELETE FROM CLOUDINARY
    if (doc.fileUrl) {
        const publicId = doc.fileUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`hrms_uploads/${publicId}`).catch(() => {});
    }

    await prisma.document.delete({ where: { id } });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    res.status(500).json({ error: "Error deleting document" });
  }
};