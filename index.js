const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');	
const Chat = require('./models/chat.js');
const methodOverride = require('method-override'); //ye method override karega put aur delete request ko
//const helmet = require("helmet");
//app.use(helmet());

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true})); //ye data ko parse karega jo form se aa raha hai(create route me use hoga)
app.use(express.json()); // ✅ JSON body parser
app.use(methodOverride('_method')); //ye method override karega put aur delete request ko




main()
.then(()=>
	console.log("connection successful")
)
.catch(err => 
	console.log(err)
);

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

//let chat1 = new Chat({
//	from : "John",
//	to : "Doe",
//	msg : "Hello, how are you?",
//	created_at : new Date()	
//})
//chat1.save()
//.then((res)=>{
//	console.log(res)
//})

app.get("/",(req,res)=>{
	res.send("root is working")
})

//index route
app.get("/chats", async (req, res) => {
  const chats = await Chat.find();
  const { success } = req.query;
  res.render("index", { chats, success });
});



//new route
app.get("/chats/new",(req,res)=>{
	res.render("new.ejs")
})


// middleware


// create route
app.post("/chats", async (req, res) => {
  try {
    console.log("📥 FORM body received:", req.body);  // You should see this log

    const { from, to, msg } = req.body;
    const newChat = new Chat({ from, to, msg, created_at: new Date() });
    await newChat.save();

    res.redirect("/chats?success=Chat+created+successfully!");
  } catch (err) {
    console.error("❌ Error saving chat:", err);
    res.redirect("/chats?success=Error+creating+chat");
  }
});




//edit route
app.get("/chats/:id/edit",async (req,res)=>{
	let {id} = req.params; //ye id ko params se lega jo ki url me hoga
	let chat = await Chat.findById(id); //ye chat ko db se lega id ke through
	console.log(chat);
	res.render("edit.ejs",{chat}) //ye chat ko render karega edit.ejs me
})

//update route
app.put("/chats/:id",async (req,res)=>{
	let {id}= req.params;
	let { msg : newMsg} =req.body; //ye data directly nhi aata ise parse karna padta hai
	let updatedMsg = await Chat.findByIdAndUpdate(id , {msg : newMsg} , {new : true} , {runValidators:true}) //ye chat ko db se lega id ke through aur msg ko update karega
	console.log(updatedMsg);
	res.redirect("/chats") //ye redirect karega index route pe jo ki chats ko show karega
})


//destroy route
app.delete("/chats/:id", async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);

    // check content-type
    if (req.headers['content-type'] === 'application/json') {
      return res.json({ message: "Deleted" });
    }

    // fallback for non-AJAX
    res.redirect("/chats?success=Chat+deleted+successfully!&type=danger");

  } catch (err) {
    if (req.headers['content-type'] === 'application/json') {
      return res.status(400).json({ error: "Delete failed" });
    }

    res.redirect("/chats?success=Error+deleting+chat");
  }
});




app.listen(8080 , ()=>{
	console.log('Server is running on port 8080');
})