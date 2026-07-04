require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

/* ===========================================================
   MIDDLEWARE
=========================================================== */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* ===========================================================
   STATIC FILES
=========================================================== */

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ===========================================================
   ROUTES
=========================================================== */

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const portfolioRoutes = require('./routes/portfolio');
const resumeRoutes = require('./routes/resume');
const atsRoutes = require('./routes/ats');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/upload');
const publicRoutes = require('./routes/public');

/* ===========================================================
   HEALTH CHECK
=========================================================== */

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        application: 'Portfolio & Resume Maker',
        developer: 'Keshav Shanmukh',
        version: '1.0.0',
        status: 'Backend Running Successfully',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

/* ===========================================================
   AUTH ROUTES
=========================================================== */

app.use('/api/auth', authRoutes);

/* ===========================================================
   CONTACT FORM
=========================================================== */

app.post('/api/portfolio/:slug/contact', async (req, res) => {
    try {

        const { slug } = req.params;

        const {
            visitorName,
            visitorEmail,
            messageText
        } = req.body;

        if (
            !slug ||
            !visitorName ||
            !visitorEmail ||
            !messageText
        ) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        const portfolio = await prisma.portfolio.findUnique({
            where: {
                customSlug: slug
            },
            select: {
                userId: true
            }
        });

        if (!portfolio) {
            return res.status(404).json({
                error: 'Portfolio not found'
            });
        }

        const message = await prisma.contactMessage.create({
            data: {
                portfolioOwnerId: portfolio.userId,
                visitorName,
                visitorEmail,
                messageText
            }
        });

        return res.status(201).json({
            success: true,
            message
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: 'Server Error'
        });

    }
});

/* ===========================================================
   PROTECTED API ROUTES
=========================================================== */

app.use('/api/portfolio', authMiddleware, portfolioRoutes);

app.use('/api/resume', authMiddleware, resumeRoutes);

app.use('/api/ats', authMiddleware, atsRoutes);

app.use('/api/ai', authMiddleware, aiRoutes);

app.use('/api/upload', authMiddleware, uploadRoutes);

/* ===========================================================
   PUBLIC ROUTES
=========================================================== */

app.use('/', publicRoutes);

/* ===========================================================
   DASHBOARD
=========================================================== */

app.get('/api/dashboard', authMiddleware, async (req, res) => {

    return res.json({
        success: true,
        message: 'Protected Dashboard',
        userId: req.user.id
    });

});

/* ===========================================================
   DASHBOARD MESSAGES
=========================================================== */

app.get('/api/dashboard/messages', authMiddleware, async (req, res) => {

    try {

        const messages = await prisma.contactMessage.findMany({

            where: {
                portfolioOwnerId: req.user.id
            },

            orderBy: {
                createdAt: 'desc'
            }

        });

        return res.json(messages);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: 'Server Error'
        });

    }

});

/* ===========================================================
   REACT FRONTEND
=========================================================== */

/*
    If the React application is built and copied into:

    backend/public/

    Express will automatically serve it.

    Otherwise the backend continues to work normally.
*/

const frontendPath = path.join(__dirname, 'public');

if (fs.existsSync(frontendPath)) {

    app.use(express.static(frontendPath));

    app.get('*', (req, res) => {

        if (req.path.startsWith('/api')) {
            return res.status(404).json({
                error: 'API Route Not Found'
            });
        }

        res.sendFile(path.join(frontendPath, 'index.html'));

    });

}

/* ===========================================================
   404 HANDLER
=========================================================== */

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: 'Route Not Found'
    });

});

/* ===========================================================
   ERROR HANDLER
=========================================================== */

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: 'Internal Server Error'

    });

});

/* ===========================================================
   SERVER
=========================================================== */

const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {

    console.error(
        'FATAL: JWT_SECRET is not configured.'
    );

    process.exit(1);

}

app.listen(PORT, () => {

    console.log('=====================================');

    console.log('Portfolio & Resume Maker Backend');

    console.log(`Environment : ${process.env.NODE_ENV || 'development'}`);

    console.log(`Server Port : ${PORT}`);

    console.log(`Server URL  : http://localhost:${PORT}`);

    console.log('=====================================');

});