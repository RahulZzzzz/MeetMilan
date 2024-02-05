import React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {io} from "socket.io-client"
// import peer from './service/peer';
import ReactPlayer from "react-player"

const url = "http://localhost:8080";
const URL = "https://meet-milan-server.onrender.com";

function Room({name,room,localAudioTrack,localVideoTrack}) {
    const [message,setMessage] = useState("")
    const [chat,setChat] = useState([]);
    const [lobby,setLobby] = useState(true);
    const [socket,setSocket] = useState(null);
    const [remoteName,setRemoteName] = useState("")
    const [remoteSocketId,setRemoteSocketId] = useState(null)

    const [sendingPc, setSendingPc] = useState(null);
    const [receivingPc, setReceivingPc] = useState(null);

    // const [remoteStream,setRemoteStream] = useState()
    const [remoteMediaStream, setRemoteMediaStream] = useState(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
  
    const localVideoRef = useRef()
    const remoteVideoRef = useRef()
  
    // const socket = useMemo(()=>
    //   io("https://localhost:8080",{
    //     // autoConnect: false
    //   })
    // ,[]);
    
    
    const joinHandler = (e)=>{
      e.preventDefault()
    //   console.log(message);
      socket.emit('to-room',{message,name,room})
      setMessage("")
    }


    useEffect(()=>{

        const socket = io(URL);

        socket.emit('join-room',{room,name});

        socket.on('user-joined',({partnerId,name})=>{
            console.log("user joined",name,partnerId);
            setRemoteName(name);
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on('send-offer',async({roomId})=>{
            console.log("sending offer");
            setLobby(false);

            const pc = new RTCPeerConnection();

            setSendingPc(pc);
            // console.log("-------SENDING PC ------",sendingPc);

            if(localVideoTrack){
                console.error("added tack");
                console.log(localVideoTrack)
                pc.addTrack(localVideoTrack)
            }

            if (localAudioTrack) {
                console.error("added tack");
                console.log(localAudioTrack)
                pc.addTrack(localAudioTrack)
            }

            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally");
                if (e.candidate) {
                    console.log(e.candidate);
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "sender",
                    roomId
                   })
                }
            }

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation neeeded, sending offer");
                const sdp = await pc.createOffer();
                
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }

        });

        socket.on('offer',async({roomId,sdp: remoteSdp})=>{
            console.log("recieved offer");

            setLobby(false);

            const pc = new RTCPeerConnection();

            pc.setRemoteDescription(remoteSdp);

            const sdp = await pc.createAnswer();
            pc.setLocalDescription(sdp);

            const stream = new MediaStream();
            if(remoteVideoRef.current){
                remoteVideoRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream)

            setReceivingPc(pc);

            pc.ontrack= (e)=>{
                alert("ontrack");
            }

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("on ice candidate on receiving seide");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "receiver",
                    roomId
                   })
                }
            }

            socket.emit('answer',{roomId,sdp});

            setTimeout(() => {
                console.log("====RECEIVeing PC ======",pc);
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1)
                } else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteVideoRef.current.play();
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
            }, 5000)

        })

        socket.on('answer',({roomId,sdp: remoteSdp})=>{
            setLobby(false);
            setSendingPc(pc=>{
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            })
            console.log("loop closed");
        })

        socket.on("add-ice-candidate",({candidate,type})=>{
            console.log("add ice candidate from remote");
            console.log({candidate,type});
            if(type=="sender"){
                setReceivingPc(pc=>{
                    if(!pc){
                        console.error("recieving pc not found");
                    }else{
                        console.log(pc.ontrack);
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                })
            }else{
                setSendingPc(pc=>{
                    if (!pc) {
                        console.error("sending pc nout found")
                    } else {
                        // console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                })
            }
        })

        socket.on('recieve-message',({message,name,room})=>{
            setChat(chat=>{
                
                return [...chat,[message,name]];
            })
        })

        setSocket(socket)

        return () => {
            socket.disconnect();
        };

    },[])
    
    useEffect(()=>{
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef])
  
  
    useEffect(()=>{
      
        //for messaging
        
  
      
      
  
    },[])
  
    return (
      <div className=' flex flex-row gap-2 flex-wrap justify-around '>
        {/* <h2>{remoteSocketId}</h2> */}
        
        <div className=' flex flex-col gap-2 basis-1/4'>
            <video className=' min-w-[250px] border-2 p-1 rounded-sm border-neutral-900' autoPlay width={400} height={400} ref={localVideoRef}/>
            {lobby? <h2>Waiting Someone to connenct</h2> : null}
            <video className=' min-w-[250px] border-2 p-1 rounded-sm border-neutral-900' autoPlay width={400} height={400} ref={remoteVideoRef} />
        </div>
        <div className=' flex flex-col justify-between basis-2/4'>
            <div className='flex flex-col gap-2 place-items-center lg:text-3xl sm:text-xl'>
                <div className=' font-bold text-center '>{name} {remoteName?<>and {remoteName}</>:null} in the Room</div>
                <div className=' font-bold text-center'>Room : {room}</div>
            </div>
            <div >
            {chat.map((item,i)=>(
                <div key={i}>
                    <span>{item[1]} : </span>  
                    <span>{item[0]}</span>
                </div>
                ))}
            <form className=' flex gap-2'  onSubmit={joinHandler}>
                <input className=' min-w-[150px] p-2 rounded-md w-[85%] border-[1px] border-zinc-900' type='text' value={message} onChange={(e)=>{ setMessage(e.target.value); }}></input>
                <button className=' w-[10%] border-[1px] border-zinc-900 min-w-[74px]' type='submit' >Send</button>
            </form>
            </div>
        </div>

        
        
      </div>
    )
}

export default Room