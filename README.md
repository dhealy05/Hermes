#Dchat—Decentralized, Serverless Chat using Blockstack

There are countless examples of governments, corporations and other actors monitoring, surveilling and restricting communications channels. Dchat makes direct peer to peer communications possible, using no external servers or central points of failure, using Blockstack’s Atlas and Gaia routing and storage architecture, with the Bitcoin blockchain as the source of truth. Users own their own data, sharing only with whom they choose, thereby solving the problem of surveillance.

#Discovery

With Blockstack.js, it is possible to query a Blockstack ID for a given app and see any publicly readable file associated with this ID. It is also possible to query the local Blockstack Core Node for a list of all Blockstack IDs on the Bitcoin blockchain. From these two simple components, server less communications are possible.

When a user signs on to Dchat for the first time, the app will generate a private key and a public key for them: the Discovery keys. We will save the private key as a private encrypted file on that user’s Gaia storage, and the public key as a public, unencrypted file readable by anyone. The public key is saved with a common naming convention, e.g. Discovery.json.

Consider two Dchat users, Dan and Lea. To send Lea a message, Dan must query her Blockstack ID and the file “Discovery.json.” Dan now has Lea’s public key. Dan composes a message and encrypts it with Lea’s public key. He (or rather, his instance of Dchat) also generates a second private key and public key, the Conversation key. He also generates a pseudorandom identifier, the ConversationID. He encrypts his message to Lea, the Conversation key, and the ConversationID, and saves them all to a publicly readable file, again with a common naming convention, e.g. Introductions.json. This file consists of an array of encrypted strings; Dan’s message to Lea is pushed to the array. Dan also saves his conversation attempt to a private file, Conversations.json, with the ConversationID stored there.

How does Lea know that Dan has tried to begin a conversation? As mentioned before, we can query the local Blockstack Core Node for all the Blockstack IDs on the network. On opening Dchat, Lea will iterate through each Blockstack ID, and query each one for Introductions.json. If it exists, she will iterate through the array of strings, and attempt to decrypt each one using her private Discovery key. If she can decrypt it, the message was intended for her! Now, Lea has the Blockstack ID of whoever initiated the conversation, the content of the message, and the Conversation keys and ID. She writes a response to Dan, encrypts it with the Conversation public key, and saves it publicly named after the ConversationID.

How does Dan receive the response? In addition to polling the blockchain for new conversations, Dan is polling his existing conversations for new messages. He queries Lea’s Blockstack ID for a public file named with the ConversationID. When he finds it, he decrypts it using the Conversation key. Now he can update his conversation state with her new message.

Now that they are communicating, Dan deletes his message to Lea from Introductions.json.

#Potential Concerns

It’s not clear to me how much of the conversation should be publicly available. Since each party to the conversation will need to store their own copy anyways, it may be that the mutually-publicly readable conversation should have only the most recent 25 messages or something, in case of some kind of attack.

Polling the blockchain may be difficult and time consuming. This is a space where optimization will be important. With that said, logically it makes sense to me that in a server less app, the client will need to do significantly more work.
