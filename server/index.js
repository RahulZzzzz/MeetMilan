import express from 'express'
import {createServer} from "http"//httpo
// import https from "https"//https
// import fs from 'fs'//https
import { Server } from 'socket.io'
import cors from "cors"


const app = express()

const port = 8080

const clientUrl = "http://localhost:5173";

// const key = fs.readFileSync('cert.key');
// const cert = fs.readFileSync('cert.crt');

const server = createServer(app);//httpo
// const server = https.createServer({key,cert},app);//https
const io = new Server(server,{
    cors:{
        // origin:"*"
        origin: {clientUrl},//Dhayan se
        credentials: true,
    }
})


const roomToSocketMap = new Map();
const socketIdToRoomMap = new Map();


app.use(cors({
    // origin:"*"
    origin: {clientUrl},//dhayan se
    credentials: true,
}))

app.get("/",(req,res)=>{
    res.send('<h1>Hello world</h1>')
})

io.on("connection",(socket)=>{
    // console.log("User Connected", socket.id);

    socket.on('to-room',(m)=>{
        // console.log("in IO connection",m);
        // socket.join(m.room)
        io.to(m.room).emit('recieve-message',m)
    })

    socket.on('join-room',({room,name})=>{
        if(!roomToSocketMap.get(room)){
            roomToSocketMap.set(room,[{socket,name}])
        }else{
            roomToSocketMap.get(room).push({socket,name});
            const a = roomToSocketMap.get(room);
            io.to(a[0].socket.id).emit('user-joined',{partnerId:a[1].socket.id,name:a[1].name});
            io.to(a[1].socket.id).emit('user-joined',{partnerId:a[0].socket.id,name:a[0].name});
        }
        // console.log(`${socket.id} is connected in romm ${room}` );
        socketIdToRoomMap.set(socket.id,room);
        socket.join(room)
        socket.emit("lobby");
        if(roomToSocketMap.get(room).length > 1){
            const a = roomToSocketMap.get(room);
            a[0].socket.emit('send-offer',{roomId:room})
            a[1].socket.emit('send-offer',{roomId:room})
        }
    })
    
    socket.on("offer",({sdp,roomId})=>{
        if(!roomId){
            return;
        }

        const a = roomToSocketMap.get(roomId)

        const receivingSocket = a[0].socket.id===socket.id ? a[1].socket : a[0].socket;

        receivingSocket.emit("offer",{
            sdp,
            roomId
        })

    })

    socket.on("answer",({sdp,roomId})=>{
        if(!roomId){
            return;
        }

        const a = roomToSocketMap.get(roomId)

        const receivingSocket = a[0].socket.id===socket.id ? a[1].socket : a[0].socket;

        receivingSocket.emit("answer",{sdp,roomId});


    })

    socket.on("add-ice-candidate",({candidate,roomId,type})=>{
        if(!roomId){
            return;
        }
        const a = roomToSocketMap.get(roomId)

        const receivingSocket = a[0].socket.id===socket.id ? a[1].socket : a[0].socket;

        receivingSocket.emit("add-ice-candidate",({candidate,type}))

    })
    
    socket.on("disconnect",()=>{
        const room = socketIdToRoomMap.get(socket.id)
        const a = roomToSocketMap.get(room);
        // console.log("Before",a);
        if(a && a[0].socket.id==socket.id){
            if(a.length==1){
                roomToSocketMap.delete(room);
            }else{
                roomToSocketMap.get(room).shift()
            }
        }
        else if(a && a[1].socket.id==socket.id){
            roomToSocketMap.get(room).pop()
        }
        // console.log("After",roomToSocketMap.get(room));
        // console.log("before",socketIdToRoomMap.get(socket.id));
        socketIdToRoomMap.delete(socket.id);
        // console.log("after",socketIdToRoomMap.get(socket.id));
    })
    
})

// io.on('to-all',(message)=>{
//     console.log("message recieved",message);
// })




server.listen(port,()=>{
    console.log(`server is listening on port : ${port}`);
})
