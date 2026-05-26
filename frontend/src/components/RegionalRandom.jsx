import { useState } from "react"
import axios from "axios"
import RecipeLoader from "./RecipeLoader"

// ── North Indian Dish list (name, veg, time in minutes) ───────────────────
const NORTH_INDIAN = [
  // Paneer & Vegetarian Curries
  { name: "Butter Paneer Masala", veg: true, time: 35 },
  { name: "Paneer Tikka Masala", veg: true, time: 40 },
  { name: "Palak Paneer", veg: true, time: 30 },
  { name: "Kadai Paneer", veg: true, time: 35 },
  { name: "Shahi Paneer", veg: true, time: 40 },
  { name: "Matar Paneer", veg: true, time: 30 },
  { name: "Paneer Bhurji", veg: true, time: 20 },
  { name: "Paneer Pasanda", veg: true, time: 45 },
  { name: "Paneer Lababdar", veg: true, time: 40 },
  { name: "Paneer Do Pyaza", veg: true, time: 35 },
  { name: "Malai Kofta", veg: true, time: 45 },
  { name: "Palak Kofta", veg: true, time: 40 },
  { name: "Lauki Kofta", veg: true, time: 40 },
  { name: "Chana Masala", veg: true, time: 35 },
  { name: "Pindi Chole", veg: true, time: 40 },
  { name: "Amritsari Chole", veg: true, time: 45 },
  { name: "Aloo Chole", veg: true, time: 30 },
  { name: "Rajma Masala", veg: true, time: 60 },
  { name: "Dal Makhani", veg: true, time: 60 },
  { name: "Dal Tadka", veg: true, time: 25 },
  { name: "Dal Fry", veg: true, time: 25 },
  { name: "Panchmel Dal", veg: true, time: 35 },
  { name: "Sultani Dal", veg: true, time: 35 },
  { name: "Langar Wali Dal", veg: true, time: 60 },
  { name: "Amritsari Dal", veg: true, time: 50 },
  { name: "Kadhi Pakoda", veg: true, time: 40 },
  { name: "Aloo Gobi Mattar", veg: true, time: 30 },
  { name: "Aloo Jeera", veg: true, time: 20 },
  { name: "Aloo Dum (Kashmiri Style)", veg: true, time: 35 },
  { name: "Aloo Methi", veg: true, time: 25 },
  { name: "Aloo Baingan", veg: true, time: 30 },
  { name: "Baingan Bharta", veg: true, time: 35 },
  { name: "Bhindi Do Pyaza", veg: true, time: 25 },
  { name: "Kurkuri Bhindi", veg: true, time: 20 },
  { name: "Masala Bhindi", veg: true, time: 20 },
  { name: "Sarson Ka Saag", veg: true, time: 45 },
  { name: "Mix Vegetable Sabzi", veg: true, time: 30 },
  { name: "Veg Jalfrezi", veg: true, time: 25 },
  { name: "Veg Makhanwala", veg: true, time: 35 },
  { name: "Methi Matar Malai", veg: true, time: 30 },
  { name: "Gobi Musallam", veg: true, time: 45 },
  { name: "Kashmiri Dum Olav", veg: true, time: 40 },
  { name: "Dahi Wale Aloo", veg: true, time: 25 },
  { name: "Kathal Ki Sabzi", veg: true, time: 50 },
  { name: "Gatte Ki Sabzi", veg: true, time: 40 },
  { name: "Ker Sangri", veg: true, time: 45 },
  { name: "Bharwan Shimla Mirch", veg: true, time: 35 },
  { name: "Bharwan Baingan", veg: true, time: 40 },
  { name: "Navratan Korma", veg: true, time: 35 },
  { name: "Kaju Curry", veg: true, time: 30 },
  { name: "Aloo Gobi", veg: true, time: 25 },
  { name: "Aloo Shimla Mirch", veg: true, time: 20 },
  { name: "Mushroom Do Pyaza", veg: true, time: 25 },
  { name: "Methi Malai Matar", veg: true, time: 30 },

  // Chicken, Mutton & Non-Veg
  { name: "Butter Chicken", veg: false, time: 45 },
  { name: "Chicken Tikka Masala", veg: false, time: 50 },
  { name: "Kadai Chicken", veg: false, time: 40 },
  { name: "Mughlai Chicken Korma", veg: false, time: 50 },
  { name: "Chicken Do Pyaza", veg: false, time: 40 },
  { name: "Chicken Changezi", veg: false, time: 45 },
  { name: "Saag Chicken", veg: false, time: 40 },
  { name: "Methi Chicken", veg: false, time: 40 },
  { name: "Chicken Lababdar", veg: false, time: 45 },
  { name: "Handi Chicken", veg: false, time: 45 },
  { name: "Tandoori Chicken", veg: false, time: 60 },
  { name: "Chicken Afghani", veg: false, time: 50 },
  { name: "Kashmiri Rogan Josh", veg: false, time: 60 },
  { name: "Mutton Korma", veg: false, time: 70 },
  { name: "Bhuna Gosht", veg: false, time: 60 },
  { name: "Mutton Do Pyaza", veg: false, time: 60 },
  { name: "Saag Gosht", veg: false, time: 55 },
  { name: "Nihari", veg: false, time: 120 },
  { name: "Champaran Mutton", veg: false, time: 90 },
  { name: "Laal Maas", veg: false, time: 60 },
  { name: "Railway Mutton Curry", veg: false, time: 60 },
  { name: "Keema Matar", veg: false, time: 35 },
  { name: "Amritsari Fish Fry", veg: false, time: 30 },
  { name: "Tari Wali Chicken Curry", veg: false, time: 40 },

  // Kebabs & Starters
  { name: "Chicken Tikka", veg: false, time: 45 },
  { name: "Chicken Malai Tikka", veg: false, time: 45 },
  { name: "Chicken Seekh Kebab", veg: false, time: 35 },
  { name: "Mutton Seekh Kebab", veg: false, time: 40 },
  { name: "Galouti Kebab", veg: false, time: 40 },
  { name: "Shami Kebab", veg: false, time: 45 },
  { name: "Kakori Kebab", veg: false, time: 45 },
  { name: "Tunday Kebab", veg: false, time: 50 },
  { name: "Reshmi Kebab", veg: false, time: 40 },
  { name: "Paneer Tikka", veg: true, time: 35 },
  { name: "Achari Paneer Tikka", veg: true, time: 40 },
  { name: "Malai Paneer Tikka", veg: true, time: 40 },
  { name: "Tandoori Aloo", veg: true, time: 30 },
  { name: "Tandoori Gobi", veg: true, time: 30 },
  { name: "Veg Seekh Kebab", veg: true, time: 30 },
  { name: "Hara Bhara Kebab", veg: true, time: 30 },
  { name: "Dahi Ke Kebab", veg: true, time: 35 },
  { name: "Soya Chaap Tikka", veg: true, time: 35 },

  // Rice & Biryanis
  { name: "Awadhi Mutton Biryani", veg: false, time: 90 },
  { name: "Lucknowi Chicken Biryani", veg: false, time: 80 },
  { name: "Veg Dum Biryani", veg: true, time: 60 },
  { name: "Paneer Makhani Biryani", veg: true, time: 60 },
  { name: "Kashmiri Pulao", veg: true, time: 35 },
  { name: "Matar Pulao", veg: true, time: 25 },
  { name: "Jeera Rice", veg: true, time: 15 },
  { name: "Mutton Yakhni Pulao", veg: false, time: 70 },
  { name: "Chicken Pulao", veg: false, time: 50 },
  { name: "Paneer Pulao", veg: true, time: 25 },
  { name: "Khichdi", veg: true, time: 25 },

  // Flatbreads
  { name: "Tandoori Roti", veg: true, time: 15 },
  { name: "Rumali Roti", veg: true, time: 20 },
  { name: "Plain Naan", veg: true, time: 20 },
  { name: "Butter Naan", veg: true, time: 20 },
  { name: "Garlic Naan", veg: true, time: 20 },
  { name: "Cheese Naan", veg: true, time: 25 },
  { name: "Keema Naan", veg: false, time: 30 },
  { name: "Amritsari Kulcha", veg: true, time: 30 },
  { name: "Paneer Kulcha", veg: true, time: 30 },
  { name: "Aloo Kulcha", veg: true, time: 30 },
  { name: "Lachha Paratha", veg: true, time: 20 },
  { name: "Pudina Paratha", veg: true, time: 20 },
  { name: "Aloo Paratha", veg: true, time: 25 },
  { name: "Paneer Paratha", veg: true, time: 25 },
  { name: "Gobi Paratha", veg: true, time: 25 },
  { name: "Mooli Paratha", veg: true, time: 25 },
  { name: "Methi Thepla", veg: true, time: 20 },
  { name: "Bhatura", veg: true, time: 25 },
  { name: "Puri", veg: true, time: 20 },
  { name: "Bedmi Poori", veg: true, time: 30 },
  { name: "Missi Roti", veg: true, time: 20 },
  { name: "Makki Ki Roti", veg: true, time: 20 },
  { name: "Baati (Rajasthani)", veg: true, time: 60 },
  { name: "Dal Bati Churma", veg: true, time: 75 },

  // Street Food, Snacks & Chaat
  { name: "Samosa", veg: true, time: 40 },
  { name: "Aloo Tikki", veg: true, time: 25 },
  { name: "Chole Bhature", veg: true, time: 45 },
  { name: "Kachori Sabzi", veg: true, time: 40 },
  { name: "Pyaaz Kachori", veg: true, time: 40 },
  { name: "Golgappa (Pani Puri)", veg: true, time: 20 },
  { name: "Papdi Chaat", veg: true, time: 20 },
  { name: "Dahi Bhalla", veg: true, time: 30 },
  { name: "Raj Kachori", veg: true, time: 45 },
  { name: "Samosa Chaat", veg: true, time: 15 },
  { name: "Aloo Tikki Chaat", veg: true, time: 20 },
  { name: "Palak Patta Chaat", veg: true, time: 25 },
  { name: "Ram Ladoo", veg: true, time: 20 },
  { name: "Paneer Pakoda", veg: true, time: 20 },
  { name: "Mix Veg Pakoda", veg: true, time: 20 },
  { name: "Mirchi Vada", veg: true, time: 20 },
  { name: "Bread Pakoda", veg: true, time: 15 },
  { name: "Matar Kulcha", veg: true, time: 30 },
  { name: "Bhel Puri", veg: true, time: 10 },
  { name: "Sev Puri", veg: true, time: 10 },
  { name: "Pani Puri", veg: true, time: 15 },

  // Sweets & Desserts
  { name: "Gulab Jamun", veg: true, time: 40 },
  { name: "Rasgulla", veg: true, time: 40 },
  { name: "Rasmalai", veg: true, time: 50 },
  { name: "Gajar Ka Halwa", veg: true, time: 45 },
  { name: "Moong Dal Halwa", veg: true, time: 50 },
  { name: "Sooji Ka Halwa", veg: true, time: 20 },
  { name: "Kheer (Rice Pudding)", veg: true, time: 40 },
  { name: "Makhana Kheer", veg: true, time: 30 },
  { name: "Rabri", veg: true, time: 45 },
  { name: "Shahi Tukda", veg: true, time: 30 },
  { name: "Phirni", veg: true, time: 30 },
  { name: "Malpua", veg: true, time: 30 },
  { name: "Jalebi", veg: true, time: 35 },
  { name: "Kulfi Falooda", veg: true, time: 15 },
  { name: "Ghevar", veg: true, time: 60 },
  { name: "Motichoor Laddoo", veg: true, time: 45 },
  { name: "Besan Laddoo", veg: true, time: 30 },
  { name: "Gujiya", veg: true, time: 60 },
  { name: "Kalakand", veg: true, time: 35 },

  // Drinks
  { name: "Sweet Lassi", veg: true, time: 10 },
  { name: "Mango Lassi", veg: true, time: 10 },
  { name: "Salted Chaas", veg: true, time: 5 },
  { name: "Masala Chai", veg: true, time: 10 },
  { name: "Shahi Thandai", veg: true, time: 15 },
  { name: "Jaljeera", veg: true, time: 10 },
]

// ── South Indian Dish list (name, veg, time in minutes) ───────────────────
const SOUTH_INDIAN = [
  // Breakfast & Tiffin — Dosas
  { name: "Plain Dosa", veg: true, time: 20 },
  { name: "Masala Dosa", veg: true, time: 30 },
  { name: "Mysore Masala Dosa", veg: true, time: 30 },
  { name: "Rava Dosa", veg: true, time: 20 },
  { name: "Onion Rava Masala Dosa", veg: true, time: 25 },
  { name: "Ghee Roast Dosa", veg: true, time: 20 },
  { name: "Paper Roast Dosa", veg: true, time: 20 },
  { name: "Set Dosa", veg: true, time: 20 },
  { name: "Cheese Dosa", veg: true, time: 20 },
  { name: "Egg Dosa (Muttai Dosa)", veg: false, time: 15 },
  { name: "Paneer Dosa", veg: true, time: 25 },
  { name: "Ragi Dosa", veg: true, time: 20 },
  { name: "Oats Dosa", veg: true, time: 20 },
  { name: "Neer Dosa", veg: true, time: 20 },
  { name: "Adai Dosa", veg: true, time: 25 },
  { name: "Pesarattu", veg: true, time: 25 },

  // Idli varieties
  { name: "Plain Idli", veg: true, time: 20 },
  { name: "Kanchipuram Idli", veg: true, time: 25 },
  { name: "Tatte Idli", veg: true, time: 25 },
  { name: "Podi Idli", veg: true, time: 15 },
  { name: "Fried Idli", veg: true, time: 15 },
  { name: "Rava Idli", veg: true, time: 25 },

  // Vada varieties
  { name: "Medu Vada", veg: true, time: 25 },
  { name: "Sambar Vada", veg: true, time: 25 },
  { name: "Rasa Vada", veg: true, time: 25 },
  { name: "Dahi Vada (Thayir Vadai)", veg: true, time: 30 },
  { name: "Maddur Vada", veg: true, time: 25 },
  { name: "Masala Vada (Paruppu Vadai)", veg: true, time: 25 },

  // Uttapam
  { name: "Onion Uttapam", veg: true, time: 20 },
  { name: "Tomato Onion Uttapam", veg: true, time: 20 },
  { name: "Mixed Vegetable Uttapam", veg: true, time: 20 },
  { name: "Ghee Podi Uttapam", veg: true, time: 20 },

  // Upma & other tiffin
  { name: "Rava Upma", veg: true, time: 20 },
  { name: "Semiya Upma", veg: true, time: 20 },
  { name: "Khara Bhath", veg: true, time: 20 },
  { name: "Kesari Bhath", veg: true, time: 20 },
  { name: "Chow Chow Bhath", veg: true, time: 25 },
  { name: "Kuzhi Paniyaram", veg: true, time: 25 },
  { name: "Masala Paniyaram", veg: true, time: 25 },
  { name: "Sweet Paniyaram", veg: true, time: 25 },
  { name: "Appam", veg: true, time: 25 },
  { name: "Idiyappam (String Hoppers)", veg: true, time: 30 },
  { name: "Puttu", veg: true, time: 20 },
  { name: "Malabar Parotta", veg: true, time: 35 },
  { name: "Poori Korma", veg: true, time: 35 },

  // Rice & Biryanis
  { name: "Hyderabadi Chicken Biryani", veg: false, time: 80 },
  { name: "Hyderabadi Mutton Biryani", veg: false, time: 90 },
  { name: "Thalassery Chicken Biryani", veg: false, time: 70 },
  { name: "Ambur Chicken Biryani", veg: false, time: 70 },
  { name: "Dindigul Thalappakatti Biryani", veg: false, time: 75 },
  { name: "Malabar Prawn Biryani", veg: false, time: 65 },
  { name: "Egg Biryani", veg: false, time: 50 },
  { name: "Vegetable Dum Biryani", veg: true, time: 60 },
  { name: "Mushroom Biryani", veg: true, time: 50 },
  { name: "Bisi Bele Bhath", veg: true, time: 45 },
  { name: "Curd Rice (Thayir Sadam)", veg: true, time: 10 },
  { name: "Lemon Rice (Chitranna)", veg: true, time: 15 },
  { name: "Tamarind Rice (Puliyogare)", veg: true, time: 20 },
  { name: "Tomato Rice (Thakkali Sadam)", veg: true, time: 20 },
  { name: "Coconut Rice", veg: true, time: 15 },
  { name: "Raw Mango Rice", veg: true, time: 20 },
  { name: "Pudina Rice (Mint Rice)", veg: true, time: 20 },
  { name: "Ghee Rice", veg: true, time: 20 },
  { name: "Pepper Rice", veg: true, time: 15 },
  { name: "Vangi Bhath (Brinjal Rice)", veg: true, time: 30 },
  { name: "Ven Pongal", veg: true, time: 25 },
  { name: "Sakkarai Pongal", veg: true, time: 25 },
  { name: "Aval Upma (Poha)", veg: true, time: 15 },

  // Vegetarian Curries, Gravies & Stews
  { name: "Hotel Sambar", veg: true, time: 30 },
  { name: "Tiffin Sambar", veg: true, time: 25 },
  { name: "Kerala Vegetable Avial", veg: true, time: 35 },
  { name: "Tomato Rasam", veg: true, time: 20 },
  { name: "Pepper Rasam (Milagu Rasam)", veg: true, time: 20 },
  { name: "Garlic Rasam (Poondu Rasam)", veg: true, time: 20 },
  { name: "Pineapple Rasam", veg: true, time: 20 },
  { name: "Lemon Rasam", veg: true, time: 15 },
  { name: "Ennai Kathirikai (Brinjal Curry)", veg: true, time: 30 },
  { name: "Gutti Vankaya Kura (Stuffed Eggplant)", veg: true, time: 35 },
  { name: "Vegetable Korma", veg: true, time: 30 },
  { name: "Coconut Vegetable Stew", veg: true, time: 25 },
  { name: "Kadala Curry (Black Chickpeas)", veg: true, time: 45 },
  { name: "Cherupayar Curry (Green Gram)", veg: true, time: 35 },
  { name: "Olan (Ash Gourd & Red Beans)", veg: true, time: 30 },
  { name: "Kalan (Yam & Raw Banana in Yogurt)", veg: true, time: 35 },
  { name: "Erissery (Pumpkin & Lentil)", veg: true, time: 35 },
  { name: "Pulissery (Mor Kuzhambu)", veg: true, time: 20 },
  { name: "Vendakkai Kara Kuzhambu", veg: true, time: 30 },
  { name: "Poondu Kuzhambu (Garlic Tamarind Gravy)", veg: true, time: 25 },
  { name: "Mushroom Chettinad", veg: true, time: 35 },
  { name: "Paneer Chettinad", veg: true, time: 35 },
  { name: "Beetroot Thoran", veg: true, time: 20 },
  { name: "Cabbage Poriyal", veg: true, time: 20 },
  { name: "Beans Poriyal", veg: true, time: 20 },
  { name: "Potato Fry (Urilaikilangu Varuval)", veg: true, time: 20 },
  { name: "Vazhakkai Podimas (Raw Banana Mash)", veg: true, time: 20 },
  { name: "Keerai Molagootal (Spinach & Lentil)", veg: true, time: 25 },
  { name: "Mirchi Ka Salan", veg: true, time: 30 },
  { name: "Bagara Baingan", veg: true, time: 35 },
  { name: "Koottu (Mixed Vegetable & Lentil)", veg: true, time: 35 },
  { name: "Chana Gassi (Mangalorean Chickpea)", veg: true, time: 40 },
  { name: "Tomato Gojju", veg: true, time: 20 },
  { name: "Gongura Pachadi", veg: true, time: 25 },
  { name: "Thoran", veg: true, time: 20 },

  // Chicken & Poultry Mains
  { name: "Chettinad Chicken Curry", veg: false, time: 50 },
  { name: "Kerala Chicken Stew", veg: false, time: 40 },
  { name: "Varutharacha Chicken Curry", veg: false, time: 50 },
  { name: "Nadan Kozhi Curry", veg: false, time: 45 },
  { name: "Andhra Gongura Chicken", veg: false, time: 45 },
  { name: "Andhra Chilli Chicken", veg: false, time: 35 },
  { name: "Pallipalayam Chicken Curry", veg: false, time: 40 },
  { name: "Madurai Chicken Sukka", veg: false, time: 45 },
  { name: "Mangalorean Chicken Kori Gassi", veg: false, time: 50 },
  { name: "Chicken Pepper Fry", veg: false, time: 35 },
  { name: "Kozhi Varuthathu (Kerala Fried Chicken)", veg: false, time: 35 },
  { name: "Malabar Chicken Korma", veg: false, time: 45 },
  { name: "Coorg Ghee Roast Chicken", veg: false, time: 45 },
  { name: "Hyderabadi Chicken Korma", veg: false, time: 50 },
  { name: "Chicken Salna", veg: false, time: 40 },
  { name: "Chicken 65", veg: false, time: 30 },

  // Meat Dishes
  { name: "Mutton Chettinad Curry", veg: false, time: 60 },
  { name: "Andhra Mutton Fry (Mamsam Vepudu)", veg: false, time: 50 },
  { name: "Gongura Mutton Curry", veg: false, time: 60 },
  { name: "Attukal Paya (Mutton Trotters Stew)", veg: false, time: 90 },
  { name: "Malabar Mutton Korma", veg: false, time: 60 },
  { name: "Kerala Mutton Roast", veg: false, time: 55 },
  { name: "Mutton Sukka Fry", veg: false, time: 50 },
  { name: "Coorg Pandi Curry (Pork Curry)", veg: false, time: 70 },
  { name: "Kerala Beef Fry (Beef Ularthiyathu)", veg: false, time: 50 },
  { name: "Kerala Beef Roast", veg: false, time: 50 },
  { name: "Hyderabadi Haleem", veg: false, time: 90 },
  { name: "Mutton Dalcha", veg: false, time: 60 },

  // Seafood
  { name: "Kerala Fish Curry (Meen Curry)", veg: false, time: 35 },
  { name: "Malabar Fish Mango Curry", veg: false, time: 35 },
  { name: "Meen Pollichathu", veg: false, time: 40 },
  { name: "Mangalorean Fish Curry", veg: false, time: 35 },
  { name: "Andhra Fish Pulusu", veg: false, time: 35 },
  { name: "Chettinad Fish Fry", veg: false, time: 25 },
  { name: "Kerala Prawn Roast (Chemmeen Ularthiyathu)", veg: false, time: 35 },
  { name: "Andhra Prawn Fry (Royyala Vepudu)", veg: false, time: 30 },
  { name: "Crab Chettinad Masala (Nandu Masala)", veg: false, time: 50 },
  { name: "Karimeen Fry", veg: false, time: 25 },
  { name: "Netheli Fish Fry (Anchovy)", veg: false, time: 20 },
  { name: "Kappa and Meen Curry", veg: false, time: 45 },

  // Appetizers & Snacks
  { name: "Paneer 65", veg: true, time: 25 },
  { name: "Gobi 65", veg: true, time: 25 },
  { name: "Mushroom 65", veg: true, time: 20 },
  { name: "Egg Bonda", veg: false, time: 20 },
  { name: "Mysore Bonda (Mangalore Bajji)", veg: true, time: 25 },
  { name: "Potato Bonda", veg: true, time: 25 },
  { name: "Banana Fritters (Pazham Pori)", veg: true, time: 20 },
  { name: "Onion Pakoda (South Style)", veg: true, time: 20 },
  { name: "Ribbon Pakoda", veg: true, time: 30 },
  { name: "Murukku (Chakli)", veg: true, time: 45 },
  { name: "Banana Chips (Kerala Nendran)", veg: true, time: 30 },
  { name: "Unniyappam", veg: true, time: 30 },
  { name: "Sukhiyan", veg: true, time: 30 },
  { name: "Kozhukattai (Sweet Dumplings)", veg: true, time: 40 },
  { name: "Parippu Vada", veg: true, time: 25 },
  { name: "Chilli Bajji (Milagai Bajji)", veg: true, time: 20 },
  { name: "Kothu Parotta (Veg / Egg)", veg: false, time: 25 },
  { name: "Chicken Kothu Parotta", veg: false, time: 30 },
  { name: "Akki Roti", veg: true, time: 20 },
  { name: "Jolada Roti", veg: true, time: 20 },
  { name: "Ragi Mudde", veg: true, time: 20 },
  { name: "Obbattu (Holige / Puran Poli)", veg: true, time: 45 },
  { name: "Paneer Ghee Roast", veg: true, time: 35 },
  { name: "Chicken Ghee Roast", veg: false, time: 40 },
  { name: "Nati Koli Saaru", veg: false, time: 50 },

  // Sweets & Desserts
  { name: "Paal Payasam (Rice Milk Pudding)", veg: true, time: 40 },
  { name: "Ada Pradhaman", veg: true, time: 45 },
  { name: "Semiya Payasam (Vermicelli)", veg: true, time: 25 },
  { name: "Mysore Pak", veg: true, time: 30 },
  { name: "Ghee Mysore Pak", veg: true, time: 30 },
  { name: "Tirupati Laddoo", veg: true, time: 40 },
  { name: "Kozhikodan Halwa (Kerala Black Halwa)", veg: true, time: 60 },
  { name: "Wheat Halwa (Tirunelveli Halwa)", veg: true, time: 50 },
  { name: "Kashi Halwa (Ash Gourd Halwa)", veg: true, time: 40 },
  { name: "Neyyappam", veg: true, time: 30 },
  { name: "Bobbatlu (Puran Poli)", veg: true, time: 45 },
  { name: "Rava Laddoo", veg: true, time: 25 },
  { name: "Sunnundalu (Urad Dal Laddoo)", veg: true, time: 30 },
  { name: "Double Ka Meetha", veg: true, time: 30 },
  { name: "Qubani Ka Meetha", veg: true, time: 30 },
  { name: "Kesari (Sheera)", veg: true, time: 20 },

  // Beverages
  { name: "South Indian Filter Coffee", veg: true, time: 10 },
  { name: "Sulaimani Tea (Malabar Spiced Lemon Tea)", veg: true, time: 10 },
  { name: "Nannari Sarbath", veg: true, time: 5 },
  { name: "Sambharam (Kerala Spiced Buttermilk)", veg: true, time: 5 },
  { name: "Neer Mor (Tamil Style Spiced Buttermilk)", veg: true, time: 5 },
  { name: "Vasantha Neer (Tender Coconut & Honey)", veg: true, time: 5 },
]

// ── Colour themes ──────────────────────────────────────────────────────────
const NORTH_THEME = {
  grad: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
  glow: "rgba(249,115,22,0.35)",
  badge: "rgba(249,115,22,0.15)",
  badgeText: "#f97316",
  badgeBorder: "rgba(249,115,22,0.35)",
  icon: "🏔️",
  label: "North Indian",
  sub: "Punjab · UP · Rajasthan · Kashmir"
}

const SOUTH_THEME = {
  grad: "linear-gradient(135deg, #10b981 0%, #065f46 100%)",
  glow: "rgba(16,185,129,0.35)",
  badge: "rgba(16,185,129,0.15)",
  badgeText: "#10b981",
  badgeBorder: "rgba(16,185,129,0.35)",
  icon: "🌴",
  label: "South Indian",
  sub: "Tamil Nadu · Kerala · Karnataka · Andhra"
}

// ── Time badge component ───────────────────────────────────────────────────
function TimeBadge({ minutes, theme }) {
  return (
    <span style={{
      fontSize: 9, padding: "1px 6px", borderRadius: 99,
      background: `${theme.badge}`,
      border: `1px solid ${theme.badgeBorder}`,
      color: theme.badgeText,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      whiteSpace: "nowrap"
    }}>
      ⏱ {minutes}m
    </span>
  )
}

// ── Sub-component: One regional column ────────────────────────────────────
function RegionColumn({ dishes, allDishes, theme, isDark, onRecipe, onLoading, prefs }) {
  const [picked, setPicked]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [rolling, setRolling] = useState(false)
  const [displayDish, setDisplayDish] = useState(null)

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)"
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"

  const filteredCount = dishes.length
  const totalCount    = allDishes.length
  const hiddenCount   = totalCount - filteredCount

  function rollRandom() {
    if (rolling || loading || dishes.length === 0) return
    setRolling(true)
    setPicked(null)

    let count = 0
    const total = 18
    const interval = setInterval(() => {
      const rand = dishes[Math.floor(Math.random() * dishes.length)]
      setDisplayDish(rand)
      count++
      if (count >= total) {
        clearInterval(interval)
        const finalPick = dishes[Math.floor(Math.random() * dishes.length)]
        setPicked(finalPick)
        setDisplayDish(finalPick)
        setRolling(false)
      }
    }, 80)
  }

  async function generateRecipe() {
    if (!picked || loading) return
    setLoading(true)
    if (onLoading) onLoading(true)
    try {
      const res = await axios.post("/api/recipe/generate-regional", {
        dish_name: picked.name,
        region: theme.label,
        servings: prefs?.servings || 2,
        time_minutes: picked.time,
        vegOnly: prefs?.vegOnly || false
      })
      onRecipe(res.data)
    } catch (err) {
      // Estimate nutrition ballpark based on dish category
      const name = picked.name.toLowerCase()
      let nutrition = { protein_g: 10, carbs_g: 40, fat_g: 12, calories: 300, fiber_g: 4, sugar_g: 5, sodium_mg: 380 }
      if (name.includes("biryani") || name.includes("pulao") || name.includes("rice"))
        nutrition = { protein_g: 15, carbs_g: 65, fat_g: 14, calories: 440, fiber_g: 2, sugar_g: 3, sodium_mg: 520 }
      else if (name.includes("dal") || name.includes("chana") || name.includes("rajma") || name.includes("lentil"))
        nutrition = { protein_g: 14, carbs_g: 38, fat_g: 8, calories: 280, fiber_g: 8, sugar_g: 4, sodium_mg: 340 }
      else if (name.includes("halwa") || name.includes("gulab") || name.includes("kheer") || name.includes("laddoo") || name.includes("barfi") || name.includes("jalebi") || name.includes("payasam") || name.includes("pak") || name.includes("meetha"))
        nutrition = { protein_g: 4, carbs_g: 55, fat_g: 16, calories: 370, fiber_g: 1, sugar_g: 32, sodium_mg: 120 }
      else if (name.includes("chicken") || name.includes("mutton") || name.includes("fish") || name.includes("prawn") || name.includes("egg") || name.includes("meat") || name.includes("gosht"))
        nutrition = { protein_g: 28, carbs_g: 12, fat_g: 18, calories: 320, fiber_g: 2, sugar_g: 4, sodium_mg: 480 }
      else if (name.includes("paratha") || name.includes("naan") || name.includes("roti") || name.includes("bhatura") || name.includes("kulcha") || name.includes("dosa") || name.includes("idli"))
        nutrition = { protein_g: 7, carbs_g: 42, fat_g: 10, calories: 280, fiber_g: 3, sugar_g: 2, sodium_mg: 310 }
      else if (name.includes("lassi") || name.includes("chai") || name.includes("coffee") || name.includes("buttermilk") || name.includes("juice"))
        nutrition = { protein_g: 3, carbs_g: 18, fat_g: 4, calories: 120, fiber_g: 0, sugar_g: 14, sodium_mg: 80 }

      onRecipe({
        title: picked.name,
        description: `An authentic ${theme.label} classic — ${picked.name}, made with traditional spices and techniques passed down through generations.`,
        ingredients_used: ["as per traditional recipe"],
        steps: [
          `Gather all authentic ${theme.label} spices and ingredients needed for ${picked.name}.`,
          "Prepare the base by tempering mustard seeds, curry leaves, and dry red chilies in hot oil.",
          "Add aromatics — onion, ginger, garlic — and sauté until golden and fragrant.",
          "Add the main ingredients and cook on medium heat, following the traditional technique for this dish.",
          "Add the spice blend and mix thoroughly, ensuring each ingredient is well-coated.",
          "Adjust water level, cover and simmer until the dish reaches the right consistency.",
          `Garnish with fresh coriander and serve ${picked.name} hot with the traditional accompaniment.`
        ],
        nutrition_per_serving: nutrition,
        health_score: 70,
        prep_time: `${picked.time} mins`,
        servings: 2,
        warnings: ["This is an estimated fallback — regenerate for AI-accurate nutrition."],
        positives: ["Traditional recipe with authentic spices"]
      })
    } finally {
      setLoading(false)
      if (onLoading) onLoading(false)
    }
  }

  return (
    <div style={{
      flex: "1 1 280px", minWidth: 260,
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: 20,
      padding: "1.5rem",
      backdropFilter: "blur(12px)",
      display: "flex", flexDirection: "column", gap: "1rem"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>{theme.icon}</div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20, fontWeight: 800,
          background: theme.grad,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          {theme.label}
        </div>
        <div style={{
          fontSize: 11, fontFamily: "'DM Sans', sans-serif",
          color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
          marginTop: 2
        }}>
          {theme.sub}
        </div>
      </div>

      {/* Time constraint banner */}
      {hiddenCount > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
          borderRadius: 10, fontSize: 12,
          background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
          fontFamily: "'DM Sans', sans-serif",
          color: isDark ? "rgba(251,191,36,0.85)" : "#92400e"
        }}>
          <span>⏱</span>
          <span>
            Showing <strong>{filteredCount}</strong> of {totalCount} dishes within <strong>{prefs.time} mins</strong>
            {" "}· <span style={{ opacity: 0.7 }}>{hiddenCount} hidden</span>
          </span>
        </div>
      )}

      {/* Dish display slot */}
      <div style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
        border: `1px dashed ${rolling ? theme.badgeBorder : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")}`,
        borderRadius: 14,
        padding: "1.25rem 1rem",
        textAlign: "center",
        minHeight: 80,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "border-color 0.2s"
      }}>
        {dishes.length === 0 ? (
          <span style={{ fontSize: 13, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>
            No dishes fit within {prefs.time} mins.<br />Increase your time!
          </span>
        ) : rolling ? (
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 700,
            color: theme.badgeText,
            animation: "dishFlick 0.08s ease infinite"
          }}>
            {displayDish?.name || "..."}
          </span>
        ) : picked ? (
          <div>
            <div style={{ fontSize: 10, opacity: 0.4, fontFamily: "'DM Sans', sans-serif", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Today's pick
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, fontWeight: 700,
              color: theme.badgeText, marginBottom: 6
            }}>
              {picked.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}>
                ⏱ Ready in ~{picked.time} mins
              </span>
              {picked.veg
                ? <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontFamily: "'DM Sans', sans-serif" }}>🌱 Veg</span>
                : <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}>🍗 Non-Veg</span>
              }
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 13, opacity: 0.35, fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>
            Hit the button to get a dish!
          </span>
        )}
      </div>

      {/* Roll button */}
      <button
        onClick={rollRandom}
        disabled={rolling || loading || dishes.length === 0}
        style={{
          width: "100%", padding: "0.85rem",
          borderRadius: 12,
          background: (rolling || dishes.length === 0) ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)") : theme.grad,
          border: "none",
          color: (rolling || dishes.length === 0) ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)") : "#fff",
          fontSize: 14, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif",
          cursor: (rolling || loading || dishes.length === 0) ? "not-allowed" : "pointer",
          boxShadow: (rolling || dishes.length === 0) ? "none" : `0 6px 24px ${theme.glow}`,
          transition: "all 0.3s",
          letterSpacing: "0.03em"
        }}
      >
        {rolling ? "🎲 Rolling…" : "🎲 Pick a Random Dish"}
      </button>

      {/* Generate button — shown after pick */}
      {picked && !rolling && (
        <button
          onClick={generateRecipe}
          disabled={loading}
          style={{
            width: "100%", padding: "0.85rem",
            borderRadius: 12,
            background: loading ? (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)") : "linear-gradient(135deg,#f97316,#ea580c)",
            border: "none", color: loading ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)") : "#fff",
            fontSize: 14, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 6px 24px rgba(249,115,22,0.35)",
            transition: "all 0.3s",
            animation: "fadeUp 0.3s ease"
          }}
        >
          {loading ? "🤖 AI Generating…" : `✨ Get ${picked.name} Recipe`}
        </button>
      )}

      {/* Dish pill grid */}
      <div>
        <div style={{
          fontSize: 10, opacity: 0.35, fontFamily: "'DM Sans', sans-serif",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8
        }}>
          {filteredCount} dishes within {prefs.time} mins
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 150, overflowY: "auto" }}>
          {dishes.map(d => (
            <span
              key={d.name}
              onClick={() => { if (!rolling && !loading) { setPicked(d); setDisplayDish(d) } }}
              title={`⏱ ${d.time} min · ${d.veg ? "Veg" : "Non-Veg"}`}
              style={{
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                padding: "3px 10px", borderRadius: 99,
                background: picked?.name === d.name ? theme.badge : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                border: `1px solid ${picked?.name === d.name ? theme.badgeBorder : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)")}`,
                color: picked?.name === d.name ? theme.badgeText : (isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)"),
                cursor: "pointer",
                transition: "all 0.2s",
                fontWeight: picked?.name === d.name ? 700 : 400,
                display: "inline-flex", alignItems: "center", gap: 4
              }}
            >
              {d.name}
              <span style={{ opacity: 0.5, fontSize: 10 }}>{d.time}m</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────
export default function RegionalRandom({ ctx }) {
  const { isDark, setScreen, setRecipe, prefs } = ctx
  const [loading, setLoading] = useState(false)

  function handleRecipe(recipe) {
    setRecipe(recipe)
    setScreen("result")
    setLoading(false)
  }

  // Apply time + veg filters to dish arrays
  const filteredNorth = NORTH_INDIAN.filter(d => {
    if (prefs.vegOnly && !d.veg) return false
    if (d.time > prefs.time) return false
    return true
  })

  const filteredSouth = SOUTH_INDIAN.filter(d => {
    if (prefs.vegOnly && !d.veg) return false
    if (d.time > prefs.time) return false
    return true
  })

  const allNorth = NORTH_INDIAN.filter(d => !prefs.vegOnly || d.veg)
  const allSouth = SOUTH_INDIAN.filter(d => !prefs.vegOnly || d.veg)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Section header */}
      {!loading && (
        <div style={{ textAlign: "center", paddingBottom: "0.5rem" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🍛</div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18, fontWeight: 800,
            color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)"
          }}>
            Authentic Regional Classics
          </div>
          <div style={{
            fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
            marginTop: 4
          }}>
            Pick a random traditional dish and get an AI-crafted authentic recipe
          </div>
          {/* Global time constraint indicator */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 10, padding: "6px 14px", borderRadius: 99,
            background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
            fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            color: isDark ? "rgba(251,191,36,0.9)" : "#92400e"
          }}>
            <span>⏱</span>
            <span>Time limit: <strong>{prefs.time} mins</strong> · {filteredNorth.length + filteredSouth.length} dishes available</span>
          </div>
        </div>
      )}

      {loading ? (
        <RecipeLoader isDark={isDark} />
      ) : (
        <div style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "flex-start"
        }}>
          <RegionColumn
            dishes={filteredNorth}
            allDishes={allNorth}
            theme={NORTH_THEME}
            isDark={isDark}
            onRecipe={handleRecipe}
            onLoading={setLoading}
            prefs={prefs}
          />
          <RegionColumn
            dishes={filteredSouth}
            allDishes={allSouth}
            theme={SOUTH_THEME}
            isDark={isDark}
            onRecipe={handleRecipe}
            onLoading={setLoading}
            prefs={prefs}
          />
        </div>
      )}

      <style>{`
        @keyframes dishFlick {
          0%   { opacity: 0.4; transform: translateY(-3px) }
          50%  { opacity: 1;   transform: translateY(0) }
          100% { opacity: 0.4; transform: translateY(3px) }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  )
}
