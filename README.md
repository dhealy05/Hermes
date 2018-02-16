**Hermes—Decentralized, Encrypted, Serverless Chat with Blockstack**

There are countless examples of governments, corporations and other actors monitoring, surveilling and restricting communications channels. Hermes makes direct peer to peer communications possible, using no external servers or central points of failure, using Blockstack’s Atlas and Gaia routing and storage architecture, with the Bitcoin blockchain as the source of truth. Users own their own data, shared only with whom they choose, thereby solving the problem of surveillance.

Below we describe Hermes' capabilities in greater detail, to provide context for
our architectural decisions. Particular attention has been paid to decentralization,
security and censorship-resistance, as we believe those areas are core to Hermes'
long term value proposition. When choosing between tradeoffs on the decentralization-
scalability continuum, our design philosophy has been to choose the former. We are
optimistic that Blockstack will continue to evolve in a scalable way.

**Note on Cryptographic Methods**

Wherever we have used cryptography, we have either used Blockstack's native encryption
or the NodeJS Crypto module. For brevity, in this document we will describe
pseudo-random functions as random.

**Public and Private Keys**

On logging into Hermes for the first time, a user is assigned a private and public
key. The public key is saved to a public file, public_index.json. The private key
is encrypted and saved privately.

**Beginning a Conversation Between Two People**

To begin a conversation, Alice enters the Blockstack ID of Bob, the person with who
she wishes to communicate. She fetches Bob's public_index.json, and computes their
shared secret using his public key. She then encrypts the secret itself, a message,
and a randomly generated filename (a base64 string of length 20), and saves this information as an 'Introduction' in her public_index.json.

Privately, Alice saves this information to her 'conversations.json', her encrypted
list of who she is talking to, their shared secret, and the filename. Additionally, she privately saves 'bob.id_convo', the history of their conversation, and she
publicly saves a new 'Outbox' under the filename.

**Discovering a Conversation Between Two People**

To discover Alice's introduction, Bob must iterate through a set of Blockstack IDs,
check each for a public_index.json, compute a shared secret, and attempt to decrypt any extant introductions. If Bob finds that his computed secret matches the decrypted
value of Alice's encrypted public secret, he knows the introduction was intended
for him.

Bob then decrypts the rest of the message, and saves the necessary data: the Blockstack
ID of the sender, the secret, and the decrypted filename. He saves his own Outbox
under the filename, and his private alice.id_convo.

**Beginning and Discovering a Conversation Between More Than Two People**

This process is the same as between two people, with one crucial difference. Say
Alice wants to message Bob and Cathy. She follow the same process described above
for each, encrypted a message with their respective secrets, but will also include
in her Introduction an encoded 'Group Secret', a randomly generated string.
Rather than saving the computed, shared secret, participants in group messages
save the decrypted Group Secret, and use that for future encryption and decryption.

For discovery, Bob and Cathy must each separately discover Alice's introduction,
and follow the steps outlines above.

**Sending and Receiving Messages**

Upon initiating and discovering the conversation, respectively, Alice and Bob not
only created an Outbox, but began polling each other's public data for a matching
filename. To send a message, Alice need only encrypt it using the shared secret,
and save it to her Outbox, as well as to her bob.id_convo. Bob, polling eagerly,
will decrypt it and save the message to his alice.id_convo.

**Images and Other Large Files**

While text is included in the body of any given Message, images and other large
files are encrypted and saved publicly by the sender. The Message contains not
the file itself, but the filename (again a randomly generated string).

**One to Many Messages**

In the current build, there are 4 levels of security. 1 is private information,
encrypted by Blockstack and saved only to the user's Gaia. 2 is a two-person conversation,
in which the private key is generated based on mutual public keys and information encoded
with it. 3 is a greater-than-two person conversation, in which a group secret is passed,
encrypted by method (2), on a one-to-one basis with various parties. 4, the subject of
this section, is a "Friends Only" secret, passed from one user to all of their contacts.

How is this done? On initial login, each user generates a random secret and filename.
Whenever they accept a friend request or make one, they encrypt this secret and
filename using the relevant secret for that friend/conversation, and then attach
that secret and filename to the relevant outbox. Their friend, already polling their
outbox for new messages, will find and decrypt the new secret and filename, and
save it as part of the contact.

Then, when Bob wants to find out something Alice has broadcast to her friends, he
need only look up her friends-only filename and secret, look up the filename,
and decrypt its contents with the secret.

In our current build, this technique is only being used to find out A. your friend's
friends (see Discovery and Scalability) and B. the time you were last online.
However, it's not hard to see that the social networking applications are potentially large; users could send their friends pictures, videos, and all the accoutrements of
modern social media, in a dramatically more secure way. The most computationally
expensive piece of this system is when a user wants to "unfriend" someone; the
user must generate a new filename and secret, and update all of their other friends.

We note with interest here how Blockstack's architecture naturally tends toward
a system of user privacy. Rather than "the right to an API key" (Wenger Continuations 96355016855, 2014), users have the ability to issue their own keys, a promising
development toward decentralization.

**Notes on Security and Robustness of the Hermes Messaging System**

Hermes' goals with respect to security and robustness are threefold. The first two relate to privacy: to keep message content readable only to their intended recipients,
and to conceal any metadata about messages being sent. The last concerns scalable
censorship resistance, specifically the ability for the network to persist in the face of
organized state attack.

Message content privacy is the simplest of the three. Since only the participants in a
conversation hold the keys to that conversation, encrypted messages are safe save
from computationally expensive brute force attack. Additionally, messages are unlikely
to be intercepted.

Metadata privacy is accomplished via the system of mutual random Outbox filenames.
The intention here is to obfuscate the participants in a conversation for any
would be snooper. If the Outbox naming convention was, say, bob.id_convo, someone
could poll Alice's public files to see if she had started a conversation with Bob;
if they were to discover an encrypted message, rather than a 404 error, although they
might not be able to read it, they would realize a conversation had begun. As constructed,
even if an attacker were to guess the filename from a set of 20^64 and successfully
break the encryption, they would not know the intended recipient.

Censorship resistance is derived from Hermes (and Blockstack's) decentralized
system. As constructed, for messaging to take place Hermes' only interaction
with an outside server need be a connection to a Blockstack Core Node. Right now,
that node is core.blockstack.org--hard to distinguish from a centralized system.
However, future versions of Hermes will support the ability for users to choose
a different node (once there are more available) and to run their own, locally.
Further, we intend to release a desktop version of Hermes, so that cutting off
hihermes.co does not cut off Hermes proper. Our goal is that Hermes can withstand
any attack that does not completely cut off the internet; and even there, we
are hopeful for the prospect of better developed mesh networks in the near future.

**Discovery and Scalability: The Bottleneck**

We will forthrightly state that the most pressing problem for scaling Hermes
successfully is in the field of new conversation discovery. New conversation discovery
boils down to one question: from whence do you draw the set of names to poll for
introductions? Hermes has a two tiered method of discovery. Tier 1
is two-way introductions, where in order to connect with Alice, Bob must first add
her as a contact; simultaneously, Alice must add Bob as a contact. This can be thought of as an extremely strong spam filter. However,
to truly function as messaging for the decentralized web, Hermes may need a larger
scope. To that end, for Tier 2 we have implemented "friends-of-friends" discovery, in which all contacts may be viewable by all other contacts, and encrypted to anyone else. In this case, if Alice and Bob are friends, and Bob and Catharine are friends, Alice will discover a conversation from Catharine without explicitly looking for it, thereby achieving one-way introductions. We feel the friends-of-friends approach is a good start to solving the problem of discovery, as it likely will lead to networked clusters by industry, region, interest, and other relevant categories.

There are other strategies to be explored, including more centralized options and
more computationally intensive options, but we feel that this is the most practical,
socially scalable solution for the time being.

**Paid Messages and Bitcoin Transactions**

On signing in, users generate a Bitcoin address using their application private
key. Their public address is stored in their public_index.json file and their
private key held privately, similar to the configuration for messaging.

Users may send Bitcoin to other users' Hermes' wallets, sending to a conversation
directly, or withdraw their Bitcoin to an address.

In the future, the ability to rate paid responses will likely be an interesting
feature to A. incentivize quality responses and B. create a market for cold emailing.

For this build, we are generating wallets and transactions using bitcoinjs-lib
and getting unspent output information and broadcasting transactions via the Blockchain.Info API. Although this is an external server and central point of failure, we feel it is a worthwhile compromise while
we wait for Blockstack.js to expose transaction generation (which is on the near
term roadmap). The user experience will also likely be very much enhanced when
the Hermes wallet is not different from the Blockstack wallet. Lastly, using Stacks
will be an interesting application.

**Bots**

Right now, each user is started off with the "Hermes Helper" bot, an extremely basic
bot implementation stored locally on Hermes. However, we think that one interesting
area for future exploration is in the creation of an open bot framework. How would
this work? Since a bot is a finite automaton and can be represented, more or less,
by a simple decision tree, we could create a Hermes-readable standard of bot data.
An example: 'if(text.includes('Hello')){response='Hello!'}else{response='Error'}'
is an extremely basic bot represented as a string. A user who wanted to use their
ID as a bot could publicly identify as a bot (because by default, we would assume
they are a human) by saving their bot-template publicly, and referencing it from
their public_index. A user wishing to communicate with this bot would download the
bot-template and receive responses accordingly. This is an interesting way of keeping
centralized, third party services within the network in a decentralized way that
still operates wholly within the Blockstack system; for example, Hermes would not
pull data from a 3rd party weather service to create a centralized weather bot,
but an enterprising user could; other users would see this only as another ID.

**Mobile Support**

At the time of writing (Feb 16 2018) Blockstack mobile apps are not possible.
However, it is a near-term goal of the Blockstack team (see https://forum.blockstack.org/t/blockstack-mobile-plans/3621/6?u=larry) and a crucial
feature in a successful and useful messaging app. The most difficult challenge we
forsee is maintaining privacy while using the Android or iOS notification systems.
Both leave records of messaging history with their respective owners (Google and Apple);
even encrypted or obfuscated notifications (with no more info than "You got a message!")
would allow timestamped records of conversations to be seen by third parties; additionally, even to establish a notification service, Hermes would need to be monitoring communications. It's possible that we could work around this problem by handling notifications much the same way we do now; the Hermes app would poll for messages in
the background, and push a local notification (which exist only on a user's phone)
when it found one. This will likely add to the engineering problem of building
on Blockstack for mobile.

**Future Goals**

Our immediate goals for the future include obvious and necessary performance improvements,
feature upgrades like the complete implementation of paid messages and integration
with Blockstack.js, a bot framework, and one-to-many social features. As a mission, we aim to provide security and privacy while matching the ease of use of centralized systems.
We look forward to the challenge.
