const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { cloudinary } = require('../config/cloudinary'); // Ensure this exports the cloudinary object

// --- 1. Get all documents with robust filtering ---
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

// --- 2. Create a new document ---
exports.createDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const { category, userId, departmentId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    let finalDeptId = departmentId;
    if (!finalDeptId || finalDeptId === "") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      finalDeptId = user?.departmentId;
    }

    if (!finalDeptId) {
      return res.status(400).json({ error: "Employee must be assigned to a department first." });
    }

    // Cloudinary automatically provides the full URL in req.file.path
    const fileUrl = req.file.path; 
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
      // DELETE OLD FILE FROM CLOUDINARY
      // Extract public ID from the URL (everything between last '/' and '.')
      const publicId = existingDoc.fileUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`hrms_uploads/${publicId}`);

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

// --- 4. Delete record AND Cloudinary file ---
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) return res.status(404).json({ error: "Document not found" });

    // DELETE FROM CLOUDINARY
    const publicId = doc.fileUrl.split('/').pop().split('.')[0];
    // Folder name 'hrms_uploads' should match your cloudinaryConfig.js folder name
    await cloudinary.uploader.destroy(`hrms_uploads/${publicId}`);

    // DELETE FROM DB
    await prisma.document.delete({ where: { id } });

    res.status(200).json({ message: "Document and cloud file deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    res.status(500).json({ error: "Error deleting document" });
  }
};