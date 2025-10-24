import { describe, expect, test } from "bun:test";
import { TaggedError } from "./index";

describe("TaggedError", () => {
  describe("Basic functionality", () => {
    test("should create a new error class", () => {
      class MyCustomError extends TaggedError("MyCustomError") {}

      const myCustomError = new MyCustomError();

      expect(myCustomError instanceof MyCustomError).toBe(true);
      expect(myCustomError instanceof Error).toBe(true);
      expect(myCustomError.name).toBe("MyCustomError");
      expect(myCustomError._tag).toBe("MyCustomError");
    });

    test("should have a stack trace", () => {
      class TestError extends TaggedError("TestError") {}
      const error = new TestError();

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack).toContain("TestError");
    });

    test("should set the error message to the tag by default", () => {
      class MyError extends TaggedError("MyError") {}
      const error = new MyError();

      expect(error.message).toBe("MyError");
    });

    test("should be throwable", () => {
      class ThrowableError extends TaggedError("ThrowableError") {}

      expect(() => {
        throw new ThrowableError();
      }).toThrow(ThrowableError);
    });

    test("should be catchable as Error", () => {
      class CatchableError extends TaggedError("CatchableError") {}

      try {
        throw new CatchableError();
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect(error instanceof CatchableError).toBe(true);
      }
    });
  });

  describe("Tagged property", () => {
    test("should have a _tag property", () => {
      class TaggedErr extends TaggedError("TaggedErr") {}

      const error = new TaggedErr();

      expect(error._tag).toBe("TaggedErr");
      // Note: _tag is currently writable due to how it's implemented
      expect(Object.getOwnPropertyDescriptor(error, "_tag")?.writable).toBe(
        true
      );
    });

    test("should support different tags for different error classes", () => {
      class ErrorA extends TaggedError("ErrorA") {}
      class ErrorB extends TaggedError("ErrorB") {}

      const errorA = new ErrorA();
      const errorB = new ErrorB();

      expect(errorA._tag).toBe("ErrorA");
      expect(errorB._tag).toBe("ErrorB");
      expect(errorA._tag).not.toBe(errorB._tag);
    });

    test("should allow discriminating between error types using _tag", () => {
      class NetworkError extends TaggedError("NetworkError") {}
      class ValidationError extends TaggedError("ValidationError") {}

      const errors = [new NetworkError(), new ValidationError()];

      const networkErrors = errors.filter((e) => e._tag === "NetworkError");
      const validationErrors = errors.filter(
        (e) => e._tag === "ValidationError"
      );

      expect(networkErrors.length).toBe(1);
      expect(validationErrors.length).toBe(1);
    });
  });

  describe("Props functionality", () => {
    test("should accept additional properties", () => {
      class CustomError extends TaggedError("CustomError")<{
        code: number;
        details: string;
      }> {}
      const error = new CustomError({ code: 404, details: "Not found" });

      expect(error.code).toBe(404);
      expect(error.details).toBe("Not found");
    });

    test("should handle undefined props", () => {
      class NoPropsError extends TaggedError("NoPropsError") {}
      const error = new NoPropsError();

      expect(error._tag).toBe("NoPropsError");
      expect(error instanceof Error).toBe(true);
    });

    test("should merge multiple properties", () => {
      class MultiPropsError extends TaggedError("MultiPropsError")<{
        statusCode: number;
        url: string;
        method: string;
        timestamp: string;
      }> {}

      const error = new MultiPropsError({
        statusCode: 500,
        url: "https://example.com",
        method: "GET",
        timestamp: new Date().toISOString(),
      });

      expect(error.statusCode).toBe(500);
      expect(error.url).toBe("https://example.com");
      expect(error.method).toBe("GET");
      expect(error.timestamp).toBeDefined();
    });
  });

  describe("Multiple error classes", () => {
    test("should support creating multiple distinct error classes", () => {
      class NotFoundError extends TaggedError("NotFoundError") {}
      class UnauthorizedError extends TaggedError("UnauthorizedError") {}
      class ServerError extends TaggedError("ServerError") {}

      const notFound = new NotFoundError({ resource: "user" });
      const unauthorized = new UnauthorizedError({ token: "invalid" });
      const serverError = new ServerError({ code: 500 });

      expect(notFound._tag).toBe("NotFoundError");
      expect(unauthorized._tag).toBe("UnauthorizedError");
      expect(serverError._tag).toBe("ServerError");

      expect(notFound instanceof NotFoundError).toBe(true);
      expect(notFound instanceof UnauthorizedError).toBe(false);
      expect(unauthorized instanceof UnauthorizedError).toBe(true);
      expect(unauthorized instanceof ServerError).toBe(false);
    });
  });

  describe("Edge cases", () => {
    test("should maintain correct prototype chain after throwing", () => {
      class ThrowTestError extends TaggedError("ThrowTestError")<{
        code: number;
      }> {}

      try {
        throw new ThrowTestError({ code: 123 });
      } catch (error) {
        expect(error instanceof ThrowTestError).toBe(true);
        expect(error instanceof Error).toBe(true);
        expect((error as any).code).toBe(123);
      }
    });
  });

  describe("Type safety", () => {
    test("should preserve Error properties", () => {
      class TypedError extends TaggedError("TypedError") {}
      const error = new TypedError();

      expect(error.name).toBeDefined();
      expect(error.message).toBeDefined();
      expect(error.stack).toBeDefined();
      expect(typeof error.toString).toBe("function");
    });
  });
});
