// Cybersecurity Questions Database
const runnerQuestions = [
    {
        id: 1,
        question: "You receive an email from your 'bank' asking you to click a link to verify your account details. What should you do?",
        correct: "Delete the email and contact your bank directly using official contact information",
        incorrect: "Click the link immediately to secure your account",
        explanation: "Phishing emails often impersonate banks. Always verify requests through official channels, not email links."
    },
    {
        id: 2,
        question: "Your friend sends you a USB drive with 'vacation photos'. What's the safest approach?",
        correct: "Scan it with antivirus software before opening any files",
        incorrect: "Plug it in immediately - it's from a trusted friend",
        explanation: "USB drives can contain malware, even from trusted sources. Always scan unknown media first."
    },
    {
        id: 3,
        question: "You're creating a new password for your work account. Which is more secure?",
        correct: "MyDog$Love2024Run! (longer with symbols and numbers)",
        incorrect: "Password123 (simple and easy to remember)",
        explanation: "Strong passwords should be long, include various character types, and avoid common patterns."
    },
    {
        id: 4,
        question: "You're at a coffee shop and see a free WiFi network called 'Free_Coffee_WiFi'. Should you connect?",
        correct: "Use your mobile hotspot instead - public WiFi can be unsafe",
        incorrect: "Connect immediately - free internet is always good",
        explanation: "Public WiFi networks can be fake or unsecured, allowing attackers to intercept your data."
    },
    {
        id: 5,
        question: "Your computer shows a popup saying 'Your computer is infected! Call this number immediately!' What should you do?",
        correct: "Close the popup - it's likely a scam trying to steal your money",
        incorrect: "Call the number - they're trying to help you",
        explanation: "Tech support scams use fake alerts to trick people into paying for unnecessary services."
    },
    {
        id: 6,
        question: "You receive a text message with a verification code you didn't request. What should you do?",
        correct: "Don't share it with anyone - someone may be trying to hack your account",
        incorrect: "Reply with the code to be helpful",
        explanation: "Unexpected verification codes indicate someone may be attempting to access your accounts."
    },
    {
        id: 7,
        question: "Your company asks you to enable two-factor authentication (2FA). How do you feel about this?",
        correct: "Great! 2FA adds an important security layer to protect accounts",
        incorrect: "Annoying - passwords should be enough security",
        explanation: "2FA significantly improves security by requiring a second form of verification beyond passwords."
    },
    {
        id: 8,
        question: "You get a notification that your software has an available security update. What should you do?",
        correct: "Install it promptly - security updates fix important vulnerabilities",
        incorrect: "Ignore it - updates often cause problems",
        explanation: "Security updates patch vulnerabilities that hackers could exploit. Install them promptly."
    },
    {
        id: 9,
        question: "A stranger on social media offers you a job that seems too good to be true. What should you do?",
        correct: "Research the company independently - it might be a scam",
        incorrect: "Accept immediately - it's a great opportunity",
        explanation: "Job scams often target people through social media with unrealistic offers."
    },
    {
        id: 10,
        question: "You're working from home and your family wants to use your work laptop. What should you do?",
        correct: "Use a separate device - work data should stay secure",
        incorrect: "Share it - family members are trustworthy",
        explanation: "Work devices should only be used for work to maintain security and compliance."
    },
    {
        id: 11,
        question: "You notice unfamiliar login activity on your email account. What's your first step?",
        correct: "Change your password immediately and enable 2FA",
        incorrect: "Ignore it - probably just a glitch",
        explanation: "Suspicious login activity indicates a potential security breach requiring immediate action."
    },
    {
        id: 12,
        question: "A website asks you to disable your ad blocker to view content. Should you do it?",
        correct: "Be cautious - some ads can contain malware",
        incorrect: "Always comply - websites need ad revenue",
        explanation: "Malicious ads (malvertising) can infect your computer. Consider the website's trustworthiness first."
    },
    {
        id: 13,
        question: "You're downloading software from the internet. What's the safest approach?",
        correct: "Download only from official websites and check reviews",
        incorrect: "Use any site that has the software - they're all the same",
        explanation: "Third-party download sites often bundle malware with legitimate software."
    },
    {
        id: 14,
        question: "Your antivirus software expires. What should you do?",
        correct: "Renew it immediately - antivirus protection is essential",
        incorrect: "Don't worry - modern computers don't need antivirus",
        explanation: "Antivirus software provides crucial protection against malware and should be kept current."
    },
    {
        id: 15,
        question: "You receive a call claiming to be from tech support saying your computer is compromised. What do you do?",
        correct: "Hang up - legitimate companies don't make unsolicited calls",
        incorrect: "Give them remote access to fix the problem",
        explanation: "Tech support scammers call randomly claiming computer problems to gain access or steal money."
    },
    {
        id: 16,
        question: "You're creating a backup of important files. Where's the safest place to store it?",
        correct: "Multiple locations including offline storage",
        incorrect: "Just on your computer's hard drive",
        explanation: "The 3-2-1 backup rule: 3 copies, 2 different media types, 1 offsite location."
    },
    {
        id: 17,
        question: "A colleague asks for your login credentials to check something quickly. What should you do?",
        correct: "Never share credentials - offer to do the task yourself",
        incorrect: "Share them - they're a trusted colleague",
        explanation: "Login credentials should never be shared, even with trusted colleagues. Use proper access controls instead."
    },
    {
        id: 18,
        question: "You find a USB drive in the parking lot. What should you do?",
        correct: "Turn it in to security - don't plug it into any computer",
        incorrect: "Plug it in to see what's on it and find the owner",
        explanation: "Found USB drives are often used in social engineering attacks and may contain malware."
    },
    {
        id: 19,
        question: "Your smartphone asks if you want to automatically join available WiFi networks. What should you choose?",
        correct: "Disable auto-join - manually select trusted networks only",
        incorrect: "Enable it for convenience - it saves time",
        explanation: "Auto-joining WiFi networks can connect you to malicious hotspots without your knowledge."
    },
    {
        id: 20,
        question: "You receive an urgent email from your CEO asking you to buy gift cards for a client. What should you do?",
        correct: "Verify the request through another communication method first",
        incorrect: "Buy the gift cards immediately - the CEO is waiting",
        explanation: "CEO fraud is a common scam where criminals impersonate executives to trick employees."
    },
    {
        id: 21,
        question: "Your web browser warns that a website's security certificate is invalid. What should you do?",
        correct: "Don't proceed - the connection might not be secure",
        incorrect: "Click 'proceed anyway' - certificates often have issues",
        explanation: "Invalid certificates can indicate a compromised or fake website. Trust browser security warnings."
    },
    {
        id: 22,
        question: "You want to check your bank balance while on public WiFi. What's the safest approach?",
        correct: "Use your mobile data instead of public WiFi",
        incorrect: "Use the public WiFi - banks have secure websites",
        explanation: "Public WiFi can be monitored by attackers. Use mobile data for sensitive activities."
    },
    {
        id: 23,
        question: "A pop-up advertisement claims you've won a prize and asks for personal information. What should you do?",
        correct: "Close it immediately - it's likely a scam",
        incorrect: "Provide the information - you might have actually won",
        explanation: "Unexpected prize notifications are typically scams designed to collect personal information."
    },
    {
        id: 24,
        question: "You're setting up a new online account. The password field shows your password in plain text. Is this concerning?",
        correct: "Yes - passwords should be hidden with asterisks or dots",
        incorrect: "No - it's helpful to see what you're typing",
        explanation: "Websites that don't hide passwords properly may not follow other security best practices."
    },
    {
        id: 25,
        question: "Your computer starts running very slowly and you notice unknown programs running. What should you do?",
        correct: "Run a full antivirus scan - your computer might be infected",
        incorrect: "Restart the computer - that usually fixes performance issues",
        explanation: "Sudden performance issues and unknown programs can indicate malware infection requiring immediate attention."
    }
];

const quizQuestions = [
    {
        id: 1,
        question: "What is phishing?",
        options: [
            "A method of fishing for compliments online",
            "A technique used by cybercriminals to steal sensitive information by pretending to be trustworthy",
            "A way to improve internet speed",
            "A programming language"
        ],
        correct: 1,
        explanation: "Phishing is a social engineering attack where criminals impersonate legitimate organizations to steal personal information like passwords, credit card details, or social security numbers."
    },
    {
        id: 2,
        question: "What makes a strong password?",
        options: [
            "Your birthday and name",
            "A common word from the dictionary",
            "At least 12 characters with a mix of letters, numbers, and symbols",
            "The same password for all accounts"
        ],
        correct: 2,
        explanation: "Strong passwords should be long (at least 12 characters), contain a mix of uppercase and lowercase letters, numbers, and special characters, and be unique for each account."
    },
    {
        id: 3,
        question: "What is two-factor authentication (2FA)?",
        options: [
            "Using two different browsers",
            "A security method requiring two different authentication factors to verify identity",
            "Having two passwords",
            "Logging in twice"
        ],
        correct: 1,
        explanation: "2FA adds an extra security layer by requiring something you know (password) and something you have (phone, token) or something you are (biometric) to access accounts."
    },
    {
        id: 4,
        question: "What should you do if you receive a suspicious email attachment?",
        options: [
            "Open it immediately to see what it contains",
            "Don't open it and verify the sender through another communication method",
            "Forward it to all your contacts",
            "Reply asking if it's safe"
        ],
        correct: 1,
        explanation: "Never open suspicious attachments. Verify with the sender through a separate communication method, and use antivirus software to scan any attachments before opening."
    },
    {
        id: 5,
        question: "What is ransomware?",
        options: [
            "Software that encrypts your files and demands payment for decryption",
            "A type of antivirus program",
            "A legitimate software licensing model",
            "A method to improve computer performance"
        ],
        correct: 0,
        explanation: "Ransomware is malicious software that encrypts a victim's files, making them inaccessible, and demands payment (usually in cryptocurrency) for the decryption key."
    },
    {
        id: 6,
        question: "Why are software updates important for security?",
        options: [
            "They make your computer run faster",
            "They add new features",
            "They fix security vulnerabilities that hackers could exploit",
            "They change the appearance of software"
        ],
        correct: 2,
        explanation: "Security updates patch vulnerabilities that cybercriminals could exploit to gain unauthorized access to your system or steal data. Install updates promptly."
    },
    {
        id: 7,
        question: "What is social engineering in cybersecurity?",
        options: [
            "Building social media networks",
            "Psychological manipulation to trick people into revealing confidential information",
            "Engineering software for social platforms",
            "A type of computer programming"
        ],
        correct: 1,
        explanation: "Social engineering exploits human psychology rather than technical vulnerabilities, tricking people into breaking security procedures and revealing confidential information."
    },
    {
        id: 8,
        question: "What should you do when using public WiFi?",
        options: [
            "Connect to any available network",
            "Avoid accessing sensitive information and use a VPN if possible",
            "Share the password with others",
            "Turn off all security settings for better connectivity"
        ],
        correct: 1,
        explanation: "Public WiFi networks are often unsecured and can be monitored by attackers. Avoid sensitive activities and use a VPN to encrypt your internet traffic."
    },
    {
        id: 9,
        question: "What is a VPN and why is it useful?",
        options: [
            "Very Private Network - it makes your computer faster",
            "Virtual Private Network - it creates a secure, encrypted connection over the internet",
            "Verified Personal Network - it verifies your identity",
            "Visual Programming Network - it helps with coding"
        ],
        correct: 1,
        explanation: "A VPN (Virtual Private Network) creates an encrypted tunnel between your device and a VPN server, protecting your internet traffic from interception and hiding your IP address."
    },
    {
        id: 10,
        question: "What is the principle of least privilege?",
        options: [
            "Giving users the maximum access possible",
            "Giving users only the minimum access necessary to perform their job functions",
            "Removing all user privileges",
            "Giving everyone the same level of access"
        ],
        correct: 1,
        explanation: "The principle of least privilege limits user access rights to only what is necessary for their legitimate purpose, reducing the potential damage from accidents or malicious activity."
    },
    {
        id: 11,
        question: "What should you do if you suspect your computer is infected with malware?",
        options: [
            "Continue using it normally",
            "Disconnect from the internet and run antivirus software",
            "Delete all your files",
            "Share your concerns on social media"
        ],
        correct: 1,
        explanation: "If you suspect malware infection, disconnect from the internet to prevent data theft, run a full antivirus scan, and consider seeking professional help if the problem persists."
    },
    {
        id: 12,
        question: "What is a firewall?",
        options: [
            "A wall made of fire",
            "A security system that monitors and controls incoming and outgoing network traffic",
            "A type of antivirus software",
            "A password manager"
        ],
        correct: 1,
        explanation: "A firewall is a security system that creates a barrier between trusted internal networks and untrusted external networks, filtering traffic based on predetermined security rules."
    },
    {
        id: 13,
        question: "Why should you be cautious about what you share on social media?",
        options: [
            "It's not important - share everything",
            "Personal information can be used by cybercriminals for identity theft or targeted attacks",
            "Social media companies don't allow sharing",
            "It slows down your internet connection"
        ],
        correct: 1,
        explanation: "Information shared on social media can be used by cybercriminals to craft convincing phishing attacks, steal your identity, or answer security questions for your accounts."
    },
    {
        id: 14,
        question: "What is the best way to handle suspicious phone calls claiming to be from tech support?",
        options: [
            "Give them remote access to your computer",
            "Provide your personal information to verify your identity",
            "Hang up and contact the company directly using official contact information",
            "Ask them to call back later"
        ],
        correct: 2,
        explanation: "Legitimate tech support companies don't make unsolicited calls. If you receive such calls, hang up and contact the company directly using official contact information if you have concerns."
    },
    {
        id: 15,
        question: "What is the purpose of backing up your data?",
        options: [
            "To make your computer faster",
            "To protect against data loss from hardware failure, malware, or accidents",
            "To increase storage space",
            "To share files with others"
        ],
        correct: 1,
        explanation: "Regular backups protect your important data from loss due to hardware failures, malware attacks, accidental deletion, or natural disasters. Follow the 3-2-1 backup rule for best protection."
    }
];

// Export the questions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runnerQuestions, quizQuestions };
} else {
    window.runnerQuestions = runnerQuestions;
    window.quizQuestions = quizQuestions;
}
