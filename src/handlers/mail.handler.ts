// Import Package
import SG from "@sendgrid/mail";
import _ from "lodash";

// Import Config
const sgKey = process.env.SENDGRID_API_KEY as string;

// Authorize
SG.setApiKey(sgKey);

// Send Message
function sgMail(options: any) {
  // Mail Options
  options = { ...options, from: "johngicharu@ids.company" };

  // Send
  SG.send(options).catch((e) => console.log(e.response.body));
}

// Export
export default sgMail;
