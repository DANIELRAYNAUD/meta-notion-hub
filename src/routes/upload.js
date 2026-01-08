const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar storage do Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        return {
            folder: 'meta-notion-hub',
            resource_type: isVideo ? 'video' : 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi'],
            transformation: isVideo ? undefined : [{ width: 1080, crop: 'limit' }]
        };
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max
    }
});

// ============================================
// POST /api/upload - Upload de imagem/vídeo
// ============================================
router.post('/', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const fileUrl = req.file.path;
        const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

        console.log('✅ Arquivo enviado:', fileUrl);

        res.json({
            success: true,
            url: fileUrl,
            type: fileType,
            originalName: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        console.error('❌ Erro no upload:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/upload/multiple - Upload de múltiplos arquivos (carrossel)
// ============================================
router.post('/multiple', upload.array('media', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const files = req.files.map(file => ({
            url: file.path,
            type: file.mimetype.startsWith('video/') ? 'video' : 'image',
            originalName: file.originalname
        }));

        console.log('✅ Arquivos enviados:', files.length);

        res.json({
            success: true,
            count: files.length,
            files: files
        });
    } catch (error) {
        console.error('❌ Erro no upload múltiplo:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
