import express from "express";
import { 
  updateCertificateByStudent, 

  createCertificate,
  createSignature,
  updateSignature,
  getSignature,
  getSignatureImage,
  getSignatureForStudent,
  getCertificate
} from "../controller/certificationController.js";
import { signaturesUpload } from "../sandboxUserFiles/gridFs.js"; // Assuming this is your file upload middleware

const router = express.Router();
router.post("/student/certificate/", createCertificate);

router.patch("/student/certificate-update/:studentId", updateCertificateByStudent);


router.get('/getCertificate/:userId', getCertificate)
router.post('/upload-signature', signaturesUpload.single('signature'), createSignature);
router.put('/update-signature', signaturesUpload.single('signature'), updateSignature);
router.get('/get-certificate/:studentId/class/:classId', getSignatureForStudent)
router.get('/get-signature/:userId',getSignature);router.get('/signatures/:signatureId', getSignatureImage);
export { router as certificateRouter };