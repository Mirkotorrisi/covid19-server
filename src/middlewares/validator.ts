import { NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import moment from "moment";

export const idValidation = () => {
  return [
    param("id")
      .isNumeric()
      .custom((num) => num > 0)
      .withMessage("provide a valid Id"),
  ];
};

export const patientValidation = () => {
  return [
    body("name").notEmpty().withMessage("provide a valid patient name"),
    body("email").isEmail().withMessage("provide a valid patient email"),
    body("dob")
      .custom((date) => moment(date).isBefore(moment()))
      .withMessage("provide a valid patient date of birth"),
    body("fiscal_code")
      .matches(
        "^([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1})$|([0-9]{11})$"
      )
      .withMessage("provide a valid italian fiscal code"),
    body("address").notEmpty().withMessage("provide a valid address"),
    body("phone")
      .matches("(3[1-6][0-9])(\\d{7})$")
      .withMessage("provide a valid phone number"),
    body("hasCovid")
      .isBoolean()
      .withMessage("provide a valid covid19 posivity check (true, false)"),
  ];
};

export const newSwabValidation = () => {
  return [
    body("patient_id")
      .isFloat({ min: 1 })
      .withMessage("provide a valid patient Id"),
    body("team_id").isNumeric().withMessage("provide a valid team Id"),
    body("date")
      .custom((value) => moment(value, "YYYY-MM-DD HH:mm", true).isValid())
      .withMessage("provide a valid date of execution"),
    body("type")
      .custom((value) => ["rap", "mol"].some((i) => i === value))
      .withMessage("provide a valid swab type"),
    body("done").isBoolean().withMessage("provide an execution status"),
    body("positive_res")
      .isBoolean()
      .withMessage("provide a valid result for swab (false, true)"),
  ];
};
export const userNameValidation = () => {
  return [
    body("username")
      .isLength({ min: 6, max: 20 })
      .withMessage("Username must be from 6 to 20 characters long"),
  ];
};

export const handleErrors = (req: any, res: any, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors: { [x: string]: any }[] = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};
