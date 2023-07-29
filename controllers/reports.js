// Import the  models
const Product = require('../models/product');
const Order = require('../models/order');
const Category = require('../models/category');
const axios = require('axios');

// render reports page
exports.getReports = async (req, res, next) => {
  try {
    // Retrieve unique categories and count the number of products in each category
    const totalProducts = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $project: {
          _id: 0,
          label: '$title',
          y: { $size: '$products' },
        },
      },
    ]);

    // Fetch the available products from the database and populate the category field
    const inventory = await Product.aggregate([
      {
        $match: { available: true },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $project: {
          _id: 0,
          label: { $arrayElemAt: ['$category.title', 0] },
          y: '$count',
        },
      },
    ]);

    // Fetch the orders from the database
    const orders = await Order.find();

    // Calculate the revenue by month
    const revenueByMonth = calculateRevenueByMonth(orders);

    // Calculate the sales data by month
    const salesData = calculateSalesByMonth(orders);

    // Combine the results into a single object
    const combinedData = {
      totalProducts,
      inventory,
      revenueByMonth,
      salesData,
    };

    // Return the combined result
    // res.json(combinedData);
    res.render('reports', {
      path: '/reports',
      pageTitle: 'Reports',
      user: req.session.user,
      allproducts: combinedData.totalProducts,
      inventory: combinedData.inventory,
      revenue: combinedData.revenueByMonth,
      salesdata: combinedData.salesData,
      user: req.session.user,
    });
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// get total products category wise (Pie Chart Data)
exports.getTotalProducts = async (req, res, next) => {
  try {
    // Retrieve unique categories and count the number of products in each category
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $project: {
          _id: 0,
          category: '$title',
          itemCount: { $size: '$products' },
        },
      },
    ]);

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get inventory - available products count category wise
exports.getInventory = async (req, res, next) => {
  try {
    // Fetch the available products from the database and populate the category field
    const availableProducts = await Product.find({ available: true }).populate(
      'category'
    );

    // Calculate the count of available products for each category
    const categoryCounts = countAvailableProductsByCategory(availableProducts);

    // Send the category counts as the API response
    res.json(categoryCounts);
  } catch (error) {
    console.error('Error fetching available products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//  Helper function to count the available products by category
function countAvailableProductsByCategory(availableProducts) {
  const categoryCounts = {};

  availableProducts.forEach((product) => {
    const { category } = product;

    const categoryName = category.title; // Assuming the category model has a 'title' field

    if (categoryCounts[categoryName]) {
      categoryCounts[categoryName]++;
    } else {
      categoryCounts[categoryName] = 1;
    }
  });

  return categoryCounts;
}

// get Revenue data by month using orders details (Bar Chart Data)
exports.getRevenue = async (req, res, next) => {
  try {
    // Fetch the orders from the database
    const orders = await Order.find();

    // Calculate the revenue by month
    const revenueByMonth = calculateRevenueByMonth(orders);

    // Send the revenue by month as the API response
    res.json(revenueByMonth);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Helper function to calculate revenue by month
function calculateRevenueByMonth(orders) {
  const revenueByMonth = [];

  // Initialize an array with zero revenue for each month
  const monthlyRevenue = new Array(12).fill(0);

  // Iterate through each order and accumulate the revenue by month
  orders.forEach((order) => {
    const { createdAt, products } = order;
    const month = createdAt.getMonth(); // Get the month (0-11)

    // Calculate the total revenue for the order
    const orderRevenue = products.reduce((total, product) => {
      return total + product.quantity * product.product.price;
    }, 0);

    // Add the order revenue to the corresponding month
    monthlyRevenue[month] += orderRevenue;
  });

  // Format the revenue by month as an array of objects
  const monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  for (let i = 0; i < 12; i++) {
    revenueByMonth.push({
      label: monthLabels[i],
      y: monthlyRevenue[i],
    });
  }

  return revenueByMonth;
}

// Function to calculate sales data by month
function calculateSalesByMonth(orders) {
  // Initialize an empty array to store the sales data
  const salesData = [
    { label: 'Jan', y: 0 },
    { label: 'Feb', y: 0 },
    { label: 'Mar', y: 0 },
    { label: 'Apr', y: 0 },
    { label: 'May', y: 0 },
    { label: 'Jun', y: 0 },
    { label: 'Jul', y: 0 },
    { label: 'Aug', y: 0 },
    { label: 'Sep', y: 0 },
    { label: 'Oct', y: 0 },
    { label: 'Nov', y: 0 },
    { label: 'Dec', y: 0 },
  ];

  // Iterate through each order
  orders.forEach((order) => {
    // Get the month from the order date
    const month = order.createdAt.getMonth();

    // Increment the sales count for the corresponding month
    salesData[month].y++;
  });

  return salesData;
}
