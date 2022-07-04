import Head from 'next/head'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import styled from 'styled-components'
import ChatScreen from '../../components/ChatScreen'
import Sidebar from '../../components/Sidebar'
import { auth, db } from '../../firebase'
import getRecipientEmail from '../../utils/getRecipientEmail'

const Chat = ({chat, messages}) => {
    const [user] = useAuthState(auth)
  return (
    <Container>
        <Head>
            <title>Chat with {getRecipientEmail(chat.users, user)}</title>
        </Head>
        <Sidebar/>
        <ChatContainer>
            <ChatScreen chat={chat} messages={messages}></ChatScreen>
        </ChatContainer>
    </Container>
  )
}

export default Chat

export async function getServerSideProps(context) {
    const ref = db.collection("chats").doc(context.query.id)

    //PREP the message on the server side
    const messageRes = await ref.collection("messages").orderBy("timestamp", "asc").get()
    const message = messageRes.docs.map(doc =>({
        id: doc.id,
        ...doc.data()
    })).map(message => ({
        ...message,
        timestamp: message.timestamp.toDate().getTime()
    }))

    //PREP the chats
    const chatRes = await ref.get()
    const chat = {
        id: chatRes.id,
        ...chatRes.data()
    }
    //console.log(chat,message)
    return {
        props: {
            message: JSON.stringify(message),
            chat: chat
        }
    }
}
const Container = styled.div`
    display:flex;

`
const ChatContainer = styled.div`
    flex:1;
    overflow: scroll;
    height: 100vh;

    ::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;/* IE and Edge scroll*/
    scrollbar-width: none;/* Firefox scroll*/
`