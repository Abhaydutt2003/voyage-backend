import { ApplicationStatus } from "../generated/prisma";
import type {
  ApplicationUncheckedCreateInput,
  LeaseUncheckedCreateInput,
} from "../generated/prisma";

/**
 * Type for creating a new application
 * Leverages Prisma's ApplicationUncheckedCreateInput but with specific modifications for the API
 */
export type CreateApplicationPayload = {
  // Application fields (from Prisma Application model)
  applicationDate: string; // ISO 8601 format (YYYY-MM-DD)
  status: ApplicationStatus;
  propertyId: number;
  tenantCognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
  paymentProofsBaseKeys: string[]; // Must have at least 1 element
  message?: string;

  // Lease fields (from Prisma Lease model) - these are required for application creation
  startDate: string; // ISO 8601 format (YYYY-MM-DD)
  endDate: string; // ISO 8601 format (YYYY-MM-DD)
};

/**
 * Alternative approach: Extend Prisma types directly
 * This shows how to leverage existing Prisma types while adding API-specific requirements
 */
export type CreateApplicationPayloadExtended =
  // Pick required fields from ApplicationUncheckedCreateInput
  Pick<
    ApplicationUncheckedCreateInput,
    | "applicationDate"
    | "status"
    | "propertyId"
    | "tenantCognitoId"
    | "name"
    | "email"
    | "phoneNumber"
    | "paymentProofsBaseKeys"
    | "message"
  > &
    // Pick required fields from LeaseUncheckedCreateInput
    Pick<LeaseUncheckedCreateInput, "startDate" | "endDate"> & {
      // Override types to be more specific for API
      applicationDate: string; // ISO 8601 format
      startDate: string; // ISO 8601 format
      endDate: string; // ISO 8601 format
      paymentProofsBaseKeys: string[]; // Must have at least 1 element
    };

/**
 * Type for updating application status
 */
export type UpdateApplicationStatusPayload = {
  status: ApplicationStatus;
};

/**
 * Type for application query parameters
 */
export type ApplicationQueryParams = {
  status: ApplicationStatus;
};

/**
 * Type for application agreement download parameters
 */
export type ApplicationAgreementParams = {
  userCognitoId: string;
  userType: "tenant" | "manager";
};

/**
 * Validation error type for application creation
 */
export type ApplicationValidationError = {
  field: string;
  message: string;
};

/**
 * Application creation response type
 */
export type CreateApplicationResponse = {
  success: boolean;
  applicationId?: number;
  errors?: ApplicationValidationError[];
};

/**
 * Utility type to extract only the required fields from Application model
 * Useful for frontend forms that need to know what's required vs optional
 */
export type RequiredApplicationFields = {
  [K in keyof CreateApplicationPayload]: CreateApplicationPayload[K] extends
    | string
    | number
    | boolean
    | string[]
    ? CreateApplicationPayload[K]
    : never;
};

/**
 * Frontend-friendly type with proper validation messages
 */
export type CreateApplicationFormData = {
  applicationDate: string;
  startDate: string;
  endDate: string;
  status: ApplicationStatus;
  propertyId: number;
  tenantCognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
  paymentProofsBaseKeys: string[];
  message?: string;
} & {
  // Validation state
  errors?: Partial<Record<keyof CreateApplicationFormData, string>>;
  isValid?: boolean;
};
