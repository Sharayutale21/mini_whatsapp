const mongoose = require('mongoose');
const Chat = require('./models/chat.js');

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

let chats = ([
	{
	from : "John",
	to : "Doe",
	msg : "Hello, how are you?",
	created_at : new Date()	
},
	{
	from : "Jane",
	to : "Smith",
	msg : "Hi, I'm good, thanks!",	
	created_at : new Date()
},
	{
	from : "Alice",
	to : "Bob",
	msg : "Hey, are you coming to the party tonight?",
	created_at : new Date()	
},
	{
	from : "Charlie",
	to : "Dave",
	msg : "Yes, I'll be there!",
	created_at : new Date()	
},
	{
	from : "Eve",
	to : "Frank",
	msg : "What time is the meeting tomorrow?",
	created_at : new Date()	
},
	{
	from : "Grace",
	to : "Heidi",
	msg : "It's at 10 AM.",
	created_at : new Date()	
}
])
Chat.insertMany(chats);
