import React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {io} from "socket.io-client"
// import peer from './service/peer';
import ReactPlayer from "react-player"
import Room from './Room';
import Header from './Header'


function Landing() {
    
    const [isJoined,setIsJoined] = useState(false);
    const [name,setName] = useState("");
    const [room,setRoom] = useState("");
    const [check,setCheck] = useState(true);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const videoRef = useRef(null);
    //88
    const [myStream,setMyStream] = useState();
  

    const getCam = async () => {
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        //88
        setMyStream(stream);
        // MediaStream
        const audioTrack = stream.getAudioTracks()[0]
        const videoTrack = stream.getVideoTracks()[0]
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        if (!videoRef.current) {
            return;
        }
        videoRef.current.srcObject = new MediaStream([videoTrack])
        videoRef.current.play();
        // MediaStream
    }

    //88
    function stopCamera() {
      myStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
  
    useEffect(()=>{
        if(videoRef && videoRef.current){
            getCam()
        }
        //88
        return ()=>{
          stopCamera();
        }
    },[videoRef,check])
    
  
    return (
      <div className="bg-white">
      <Header/>
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className={`mx-auto ${(isJoined)? "py-14" : "py-32 sm:py-28 lg:py-30" } `}>
          
        {(!isJoined)?
        (<div className=' flex gap-[2rem] flex-wrap justify-center items-center'>
          <form className=' flex flex-col justify-center items-center' onSubmit={(e)=>{e.preventDefault(); if(!name || !room){alert("Enter the name and room")}else{setIsJoined(true)}}}>
            <label htmlFor="name" className=' text-2xl font-bold'>Name : </label>
            <input id="name" type='text' value={name} className=' m-1 p-2 border-[1px] rounded-[4px] border-neutral-900' 
              onChange={(e)=>{setName(e.target.value);}}/>
            <br />
            <br />
            <label htmlFor="room" className=' text-2xl font-bold'>Room : </label>
            <input id="room" type='text' value={room} className=' m-2 p-2 border-[1px] rounded-[4px] border-neutral-900'
              onChange={(e)=>{ setRoom(e.target.value)}}/>
            <br />
            <br />
            <button type='submit' className=' w-[50%] border-2 border-zinc-900' >Join</button>
          </form>
          {/* <button className=' border-2 border-zinc-900' onClick={()=>{setCheck(true)}}>Check</button> */}
          {(check)? <div className=' p-[5px] border-[2px] border-neutral-900 rounded-lg'>
                      <video width={400} height={400} autoPlay ref={videoRef}/>
                    </div>
             : <></>
          }
        </div>)
  
        :
  
        (
            // <></>
            <Room name={name} room={room} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack}/>
        )
        }
          

        </div>
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
        <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
    </div>


    </div>

        
    )
}

export default Landing