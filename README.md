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

**Notes on Scalability and Discovery**
**Discovery and Scalability: The Bottleneck**

We will forthrightly state that the most pressing problem for scaling Hermes
successfully is in the field of new conversation discovery. New conversation discovery
boils down to one question: from whence do you draw the set of names to poll for
introductions? As constructed, Hermes has what we like to think of as an extremely
strong spam filter; you will only receive messages from contacts you choose to add.
Within the scope of this bounty we find this to be a reasonable solution. However,
to truly function as messaging for the decentralized web, Hermes may need a larger
scope. There are several interesting areas for further exploration regarding scalability
and discovery. These include:

-Search Indices. Search indices are the likely answer to some Blockstack scalability problems. However, given that any metadata is encrypted, it may be difficult to apply to this problem. Anything that exposed an intro to the wider network would, by definition,
expose it to surveillance.

-Friends of Friends (The Gossip Strategy). Users may choose whether or not to list
a contact as public or private. Friends could add other friends to their contact
list, and those friends, etc. This would reduce the set in an organic way, and likely
account for some use cases; networks would probably group by industry, region, language,
etc., with a correspondingly higher likelihood of messaging within those networks.

-Name Mining. Simply keeping up to date with the names on the network is a challenge
for any Blockstack application. Name mining could obviate the need for central
servers and keep name discovery within the Gaia network.

-Gradation Strategies. Going from centralized to decentralized is difficult. Going
from decentralized to centralized is considerably easier. Rather than offering a
one size fits all solution, Hermes may allow users to use a less secure, more
centralized offering, with the option of transitioning should the need arise.


**Paid Messages and Bitcoin Transactions**

On signing in, users generate a Bitcoin address using their application private
key. Their public address is stored in their public_index.json file and their
private key held privately, similar to the configuration for messaging.

Users may earn Bitcoin through reading messages, and pay Bitcoin in order to
increase their likelihood of receiving a quality response. The technical details
are as follows: Alice sends a message (in most cases likely an introduction) with a content type signifying a paid Bitcoin transaction, and stating the amount of Bitcoin on offer. However, they do not send any Bitcoin. Bob, reading the message, will see
the amount of Bitcoin he is being offered and, if he likes what he sees, he will
respond. On opening Bob's response, Alice will automatically create a transaction
and send the specified amount to Bob.

In the future, the ability to rate paid responses will likely be an interesting
feature to A. incentivize quality responses and B. create a market for cold emailing.

For this build, we are generating wallets and transactions using bitcoinjs-lib
and getting and broadcasting transactions via the Blockchain.Info API. Although this is an external server and central point of failure, we feel it is a worthwhile compromise while
we wait for Blockstack.js to expose transaction generation (which is on the near
term roadmap). The user experience will also likely be very much enhanced when
the Hermes wallet is not different from the Blockstack wallet. Lastly, using Stacks
will be an interesting application.
