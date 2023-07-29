// const path = require('path');

// const express = require('express');
// const { body } = require('express-validator/check');

// const adminController = require('../controllers/admin');
// const isAuth = require('../middleware/is-auth');

// const router = express.Router();

// // /admin/add-product => GET
// router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/products => GET
// router.get('/products', isAuth, adminController.getProducts);

// // /admin/add-product => POST
// router.post(
//   '/add-product',
//   [
//     body('title').isString().isLength({ min: 3 }).trim(),
//     body('price').isFloat(),
//     body('description').isLength({ min: 5, max: 400 }).trim(),
//   ],
//   isAuth,
//   adminController.postAddProduct
// );

// router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// router.post(
//   '/edit-product',
//   [
//     body('title').isString().isLength({ min: 3 }).trim(),
//     body('price').isFloat(),
//     body('description').isLength({ min: 5, max: 400 }).trim(),
//   ],
//   isAuth,
//   adminController.postEditProduct
// );

// router.delete('/product/:productId', isAuth, adminController.deleteProduct);

// module.exports = router;

const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroMongoose = require('@admin-bro/mongoose');
const User = require('../models/user.js');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Product = require('../models/Product');

const mongoose = require('mongoose');

AdminBro.registerAdapter(AdminBroMongoose);

const express = require('express');

const adminBro = new AdminBro({
  databases: [mongoose],
  rootPath: '/admin',
  branding: {
    companyName: 'Shop Wave',
    logo: '../img/logo.png',
    softwareBrothers: false,
  },
  resources: [
    {
      resource: Product,
      options: {
        parent: {
          name: 'Products Management',
          icon: 'InventoryManagement',
        },
      },
    },
    {
      resource: Category,
      options: {
        parent: {
          name: 'Products Management',
          icon: 'InventoryManagement',
        },
      },
    },
    {
      resource: User,
      options: {
        parent: {
          name: 'User Management',
          icon: 'User',
        },
      },
    },
    {
      resource: Order,
      options: {
        parent: {
          name: 'User Management',
          icon: 'User',
        },
      },
    },
  ],
  locale: {
    translations: {
      labels: {
        loginWelcome: 'Admin Panel Login',
      },
      messages: {
        loginWelcome:
          'Please enter your credentials to log in and manage ShopWave',
      },
    },
  },
  dashboard: {
    component: AdminBro.bundle('../components/admin-dashboard-component.jsx'),
  },
  reports: {
    component: AdminBro.bundle('../components/admin-reports-component.jsx'),
  },
});

const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    if (ADMIN.password === password && ADMIN.email === email) {
      return ADMIN;
    }
    return null;
  },
  cookieName: process.env.ADMIN_COOKIE_NAME,
  cookiePassword: process.env.ADMIN_COOKIE_PASSWORD,
});

// const router = AdminBroExpress.buildRouter(adminBro);
module.exports = router;
