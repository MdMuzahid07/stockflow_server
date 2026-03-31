/**
 * Custom Error Classes for FileSystem Operations
 *
 * This module provides specialized error classes for filesystem operations,
 * enabling precise error handling and meaningful error messages for clients.
 *
 * @module FileSystemErrors
 * @category Errors
 */

import httpStatus from "http-status";

import CustomAppError from "./CustomAppError";

/**
 * Error thrown when a requested file system node is not found.
 *
 * @class NodeNotFoundError
 * @extends CustomAppError
 *
 * @example
 * ```typescript
 * throw new NodeNotFoundError("folder-123");
 * ```
 */
export class NodeNotFoundError extends CustomAppError {
  constructor(nodeId: string, message?: string) {
    super(
      httpStatus.NOT_FOUND,
      message || `Node with ID '${nodeId}' not found or has been deleted`
    );
    this.name = "NodeNotFoundError";
  }
}

/**
 * Error thrown when attempting to create a node with a duplicate name
 * in the same parent folder.
 *
 * @class DuplicateNodeError
 * @extends CustomAppError
 *
 * @example
 * ```typescript
 * throw new DuplicateNodeError("document.txt", "folder-123");
 * ```
 */
export class DuplicateNodeError extends CustomAppError {
  constructor(nodeName: string, parentId?: string) {
    const location = parentId ? ` in folder '${parentId}'` : " in this location";
    super(httpStatus.CONFLICT, `An item named '${nodeName}' already exists${location}`);
    this.name = "DuplicateNodeError";
  }
}

/**
 * Error thrown when a parent folder reference is invalid or inaccessible.
 *
 * @class InvalidParentError
 * @extends CustomAppError
 *
 * @example
 * ```typescript
 * throw new InvalidParentError("invalid-id");
 * ```
 */
export class InvalidParentError extends CustomAppError {
  constructor(parentId: string, message?: string) {
    super(
      httpStatus.BAD_REQUEST,
      message || `Invalid parent folder: '${parentId}' does not exist or is not a folder`
    );
    this.name = "InvalidParentError";
  }
}

/**
 * Error thrown when file upload operations fail.
 *
 * @class FileUploadError
 * @extends CustomAppError
 *
 * @example
 * ```typescript
 * throw new FileUploadError("Invalid file type: .exe files are not allowed");
 * ```
 */
export class FileUploadError extends CustomAppError {
  constructor(message: string, statusCode: number = httpStatus.BAD_REQUEST) {
    super(statusCode, message);
    this.name = "FileUploadError";
  }
}

/**
 * Error thrown when a user exceeds their storage quota.
 * This is structured for future premium tier implementation.
 *
 * @class StorageQuotaExceededError
 * @extends CustomAppError
 *
 * @example
 * ```typescript
 * throw new StorageQuotaExceededError(1073741824, 1000000000);
 * ```
 */
export class StorageQuotaExceededError extends CustomAppError {
  public readonly currentUsage: number;
  public readonly quotaLimit: number;

  constructor(currentUsage: number, quotaLimit: number) {
    const currentMB = (currentUsage / (1024 * 1024)).toFixed(2);
    const limitMB = (quotaLimit / (1024 * 1024)).toFixed(2);

    super(
      httpStatus.INSUFFICIENT_STORAGE,
      `Storage quota exceeded. Current usage: ${currentMB}MB, Limit: ${limitMB}MB`
    );

    this.name = "StorageQuotaExceededError";
    this.currentUsage = currentUsage;
    this.quotaLimit = quotaLimit;
  }
}

/**
 * Error thrown when attempting invalid operations on nodes.
 *
 * @class InvalidNodeOperationError
 * @extends CustomAppError
 *
 * @example
 * ```typescript
 * throw new InvalidNodeOperationError("Cannot delete root folder");
 * ```
 */
export class InvalidNodeOperationError extends CustomAppError {
  constructor(message: string) {
    super(httpStatus.BAD_REQUEST, message);
    this.name = "InvalidNodeOperationError";
  }
}

/**
 * Error thrown when node validation fails.
 *
 * @class NodeValidationError
 * @extends CustomAppError
 *
 * @example
 * ```typescript
 * throw new NodeValidationError("Node name cannot contain special characters");
 * ```
 */
export class NodeValidationError extends CustomAppError {
  constructor(message: string, field?: string) {
    const errorMessage = field ? `${field}: ${message}` : message;
    super(httpStatus.BAD_REQUEST, errorMessage);
    this.name = "NodeValidationError";
  }
}
