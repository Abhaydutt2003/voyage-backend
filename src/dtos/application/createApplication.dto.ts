class CreateApplicationDto {
  constructor(files: Express.Multer.File[], body: any) {
    this.applicationDate = body.applicationDate;
    this.startDate = body.startDate;
    this.endDate = body.endDate;
    this.status = body.status;
    this.propertyId = body.propertyId;
    this.tenantCognitoId = body.tenantCognitoId;
    this.name = body.name;
    this.email = body.email;
    this.phoneNumber = body.phoneNumber;
    this.message = body.message;
    this.paymentProof = files;
  }

  applicationDate: string;
  endDate: string;
  startDate: string;
  status: string;
  propertyId: string;
  tenantCognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  paymentProof: Express.Multer.File[];
}

export default CreateApplicationDto;
