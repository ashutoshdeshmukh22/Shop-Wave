const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(
  'sk_test_51MrwpKSFge0RON0Bc8UVB2ESBHCBHNKErEEFT0D3fJ0zgoXXloSJrGjrVrKzXInj3j7Nx36dqse3L2xYhDvcdFRV00qR9b3626'
);

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const Category = require('../models/category');
const User = require('../models/user');

const ITEMS_PER_PAGE = 9;

exports.getProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    let totalItems;

    const numProducts = await Product.find().countDocuments();
    totalItems = numProducts;

    const products = await Product.find({})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .sort('-createdAt')
      .populate('category');

    const categories = await Category.find({});

    res.render('shop/product-list', {
      prods: products,
      categories: categories,
      pageTitle: 'Products',
      path: '/products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      user: req.session.user,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }

  // const page = +req.query.page || 1;
  // let totalItems;
  // Product.find()
  //   .countDocuments()
  //   .then((numProducts) => {
  //     totalItems = numProducts;
  //     return Product.find()
  //       .skip((page - 1) * ITEMS_PER_PAGE)
  //       .limit(ITEMS_PER_PAGE);
  //   })
  //   .then((products) => {
  //     res.render('shop/product-list', {
  //       prods: products,
  //       pageTitle: 'Products',
  //       path: '/products',
  //       currentPage: page,
  //       hasNextPage: ITEMS_PER_PAGE * page < totalItems,
  //       hasPreviousPage: page > 1,
  //       nextPage: page + 1,
  //       previousPage: page - 1,
  //       lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
  //     });
  //   })
  //   .catch((err) => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    let totalItems;
    const numProducts = await Product.find().countDocuments();
    totalItems = numProducts;
    const foundCategory = await Category.findOne({
      title: req.params.category,
    });
    const allProducts = await Product.find({ category: foundCategory._id })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .sort('-createdAt')
      .populate('category');

    const categories = await Category.find({});

    res.render('shop/product-list', {
      prods: allProducts,
      categories: categories,
      pageTitle: 'Products',
      path: '/products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      user: req.session.user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSearchProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const categories = await Category.find({});

    const products = await Product.find({
      title: { $regex: req.query.search, $options: 'i' },
    })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .sort('-createdAt')
      .populate('category')
      .exec();
    const count = await Product.count({
      title: { $regex: req.query.search, $options: 'i' },
    });
    res.render('shop/product-list', {
      prods: products,
      categories: categories,
      pageTitle: 'Search Results',
      path: '/getSearchProducts',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < count,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(count / ITEMS_PER_PAGE),
      user: req.session.user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      console.log(product);
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        user: req.session.user,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * 4)
        .limit(4);
    })
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: 4 * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / 4),
        user: req.session.user,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        user: req.session.user,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map((p) => {
          return {
            price_data: {
              currency: 'inr',
              unit_amount: p.productId.price * 100,
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
            },
            quantity: p.quantity,
          };
        }),
        mode: 'payment',
        success_url:
          req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
    })
    .then((session) => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId: session.id,
        user: req.session.user,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  const {
    firstname,
    lastname,
    country,
    address,
    city,
    state,
    pincode,
    phone,
    email,
  } = req.body;
  console.log(req.body);
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
        billingDetails: {
          firstName: firstname,
          lastName: lastname,
          country: country,
          address: address,
          city: city,
          state: state,
          pincode: pincode,
          email: email,
          phone: phone,
        },
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        user: req.session.user,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new Error('No order found.'));
  }
  if (order.user.userId.toString() !== req.user._id.toString()) {
    return next(new Error('Unauthorized'));
  }

  // Get user details
  const customerInfo = await User.findOne({ _id: order.user.userId });
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);

  const pdfDoc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="' + invoiceName + '"'
  );
  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);

  pdfDoc.image(__dirname + '/logo.png', 30, 20, {
    width: 130,
    height: 50,
  });
  pdfDoc
    .font('Helvetica')
    .fontSize(14)
    .text('Order Invoice/Bill Receipt', 400, 30, { width: 200 });
  pdfDoc.fontSize(10).text(new Date().toUTCString(), 400, 46, { width: 200 });

  pdfDoc.font('Helvetica-Bold').text('Sold by:', 30, 100);
  pdfDoc.font('Helvetica').text('Shop Wave', 30, 115, { width: 250 });
  pdfDoc.text('Sector 32A, IICMR, Nigdi', 30, 130, { width: 250 });
  pdfDoc.text('Pune' + ' ' + '435011', 30, 145, { width: 250 });
  pdfDoc.text('Maharashtra' + ' ' + 'India', 30, 160, { width: 250 });

  pdfDoc.font('Helvetica-Bold').text('Customer details:', 400, 100);
  pdfDoc
    .font('Helvetica')
    .text(customerInfo.username, 400, 115, { width: 250 });
  pdfDoc.text(customerInfo.email, 400, 130, { width: 250 });
  // pdfDoc.text(customerInfo.address, 400, 130, { width: 250 });
  // pdfDoc.text(customerInfo.city + ' ' + customerInfo.pincode, 400, 145, {
  //   width: 250,
  // });
  // pdfDoc.text(customerInfo.state + ' ' + customerInfo.country, 400, 160, {
  //   width: 250,
  // });

  pdfDoc.text('Order No:' + 'Order No', 30, 195, { width: 250 });
  pdfDoc.text('Invoice No:' + 'Invoice No', 30, 210, { width: 250 });
  pdfDoc.text('Date:' + new Date().toUTCString(), 30, 225, {
    width: 250,
  });

  pdfDoc.rect(7, 250, 595, 20).fill('#FC427B').stroke('#FC427B');
  pdfDoc.fillColor('#fff').text('No.', 20, 256, { width: 30 });
  pdfDoc.text('Product', 60, 256, { width: 300 }); // Extended width for the "Product" column
  pdfDoc.text('Qty', 390, 256, { width: 50 });
  pdfDoc.text('Price', 460, 256, { width: 50 });
  pdfDoc.text('Total Price', 530, 256, { width: 70 });

  let productNo = 1;
  let totalPrice = 0;
  let orderPrice = 0;

  order.products.forEach((element) => {
    console.log('adding', element._id);
    totalPrice += element.quantity * element.product.price;
    orderPrice += element.quantity * element.product.price;
    let y = 256 + productNo * 20;
    pdfDoc.fillColor('#000').text(productNo.toString(), 20, y, { width: 30 });
    pdfDoc.text(element.product.title, 60, y, { width: 300 }); // Adjusted width for the product title
    pdfDoc.text(element.quantity, 390, y, { width: 50 });
    pdfDoc.text(element.product.price, 460, y, { width: 50 });
    pdfDoc.text(totalPrice, 530, y, { width: 70 });
    totalPrice = 0;
    productNo++;
  });
  pdfDoc
    .rect(7, 256 + productNo * 20, 595, 0.2)
    .fillColor('#000')
    .stroke('#000');
  productNo++;

  pdfDoc.font('Helvetica-Bold').text('Total:', 400, 256 + productNo * 17);
  pdfDoc.font('Helvetica-Bold').text(orderPrice, 500, 256 + productNo * 17);

  pdfDoc.end();
};

exports.getBlogs = async (req, res, next) => {
  res.render('blog', {
    path: '/blog',
    pageTitle: 'Blogs',
    user: req.session.user,
  });
};

exports.getContactUs = (req, res, next) => {
  res.render('contact-us', {
    path: '/contact-us',
    pageTitle: 'Contact Us',
    user: req.session.user,
  });
};
