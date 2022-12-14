const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// const {checkAuth, adminRole } = require('../middleware/check-auth');

const checkAuth = require('../middleware/check-auth');
// const { authRole } = require('../middleware/basicAuth');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/',checkAuth,(req, res, next) => {
    Order.find()
    .select('product quantity _id')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return{
                    _id:doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: "GET",
                        description: "To get more detailed info",
                        url: "http://localhost:3000/products/"+doc.product
                    }
                }
            })
           
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/',checkAuth,(req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
    
    .then(product => {
        if(!product){
            return res.status(404).json({
                message: "Product not found"
            });
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        
        return order
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Order stored',
                createdOrder:{
                    _id: result._id,
                    product: result.product,
                    quantity:result.quantity
                },
                request:{
                    type:'GET',
                    description: "To get more detailed info",
                    url: "http://localhost:3000/products/"+productId
                }
            });
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });     
    });
});
    

router.get('/:orderId',checkAuth,(req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
        if(!order){
            return res.status(404).json({
                message: "Order not found"
            });
        }
        res.status(200).json({
            order: order,
            request: {
                type: "GET",
                url: 'http://localhost:3000/orders'
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    })
    
})

router.delete('/:orderId',checkAuth,(req, res, next) => {
  
    const id = req.params.orderId;

    Order.deleteOne({_id:id})
    .exec()
    .then(result =>{
        res.status(200).json({
            message: "Order deleted",
            request: {
                type:"POST",
                description: "To create more product",
                url: "http://localhost:3000/orders/",
                data : {
                    productId: 'String',
                    quantity: 'Number'
                }
            }
        })

    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;
