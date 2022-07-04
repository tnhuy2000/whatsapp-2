import { useRouter } from 'next/router'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import React, { useRef, useState } from 'react'
import { Avatar, IconButton} from '@material-ui/core'
import { useAuthState } from 'react-firebase-hooks/auth'
import styled from 'styled-components'
import { auth, db } from '../firebase'
import AttachFileSharpIcon from '@material-ui/icons/AttachFileSharp';
import MoreVertSharpIcon from '@material-ui/icons/MoreVertSharp';
import { useCollection } from 'react-firebase-hooks/firestore'
import Message from './Message'
import InsertEmoticonSharpIcon from '@material-ui/icons/InsertEmoticonSharp';
import MicNoneSharpIcon from '@material-ui/icons/MicNoneSharp';
import getRecipientEmail from '../utils/getRecipientEmail';
import TimeAgo from 'timeago-react'; 

const ChatScreen = ({chat, messages}) => {

  const [user] = useAuthState(auth)
  const [input, setInput] = useState("")
  const endOfMessagesRef = useRef(null)
  const router = useRouter()
  const [messageSnapshot] = useCollection( 
    db.collection('chats')
    .doc(router.query.id)
    .collection('messages')
    .orderBy('timestamp', 'asc')
    )
    const [recipientSnapshot] = useCollection(
        db.collection('users').where('email','==', getRecipientEmail(chat.users,user))
    )
  const showMessage = () => {
    if(messageSnapshot) {
        return messageSnapshot.docs.map((message) => (
            <Message
            key={message.id}
            user={message.data().user}
            message={{
                ...message.data(),
                timestamp: message.data().timestamp?.toDate().getTime(),
            }}/>
        ))
    }
    else
    {
        if( messages !== undefined && messages !== ''){
        
            return JSON.parse(messages).map(message => (
                <Message
                key={message.id}
                user={message.user}
                message={message}/>
            ))
        }
        
    }
  }
  const scrollToBottom = () => {
    
    const a = endOfMessagesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
    })
    console.log(a)
  }
    const sendMessage = (e) => {
        e.preventDefault();
        //update lastSeen
        db.collection('users').doc(user.uid).set({
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true})

        db.collection('chats').doc(router.query.id).collection('messages').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: input,
            user: user.email,
            photoURL: user.photoURL
        })
        setInput("")
        scrollToBottom()
    }
    const recipient = recipientSnapshot?.docs?.[0]?.data()
    const recipientEmail = getRecipientEmail(chat.users, user)

  return (
    <Container>
        <Header>
            {recipient ? (
                <Avatar src={recipient?.photoURL}/>
            ):(
                <Avatar>{recipientEmail[0]}</Avatar>
            )}
            <HeaderInformation>
                <h3>{recipientEmail}</h3>
                {recipientSnapshot ? (
                    <p>Last active: {" "}
                    {recipient?.lastSeen?.toDate() ? (
                        <TimeAgo datetime={recipient?.lastSeen?.toDate()}/>
                    ): (
                        "Unavailable"
                    )}
                    </p>
                ) : (
                    <p>Loading last active...</p>
                )}
            </HeaderInformation>
            <HeaderIcons>
                <IconButton>
                    <AttachFileSharpIcon/>
                </IconButton>
                <IconButton>                   
                    <MoreVertSharpIcon/>
                </IconButton>
            </HeaderIcons>
        </Header>
        <MessageContainer>
            {showMessage()}
            <EndOfMessage ref={endOfMessagesRef}/>
        </MessageContainer>
        <InputContainer>
            <InsertEmoticonSharpIcon/>
            <Input placeholder="Enter chats" value={input} onChange={e => setInput(e.target.value)}/>
            <button hidden disabled={!input} type="submit" onClick={sendMessage}>Send message</button>
            <MicNoneSharpIcon/>
        </InputContainer>
    </Container>
  )
}

export default ChatScreen

const Container = styled.div`
`

const Input = styled.input`
    flex: 1;
    outline: 0;
    border: none;
    border-radius: 10px;
    background-color: whitesmoke;
    padding: 20px;
    margin-left: 15px;
    margin-right: 15px;
`

const InputContainer = styled.form`
    display: flex;
    align-items: center;
    padding: 10px;
    position: sticky;
    bottom: 0;
    background-color: white;
    z-index: 100;
`

const MessageContainer = styled.div`
    padding: 30px;
    background-color: #e5ded8;
    min-height: 90vh;
`

const Header = styled.div`
    display: flex;
    position: sticky;
    top:0;
    background-color: white;
    z-index: 1;
    padding: 11px;
    height: 80px;
    align-items: center;
    border-bottom: 1px solid whitesmoke;
`


const HeaderInformation = styled.div`
    margin-left: 15px;
    flex:1;
    > h3 {
        margin-bottom: 3px;
    }
    >p {
        font-size: 14px;
        color: gray;
    }
`
const HeaderIcons = styled.div``


const EndOfMessage = styled.div`
    margin-bottom: 50px;
`