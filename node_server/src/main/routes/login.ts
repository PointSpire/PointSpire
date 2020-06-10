import express from 'express';
const router = express.Router();

/* GET login page. */
router.get('/', function (req, res) {
  res.render('login', { title: 'Express' });
});

export default router;
