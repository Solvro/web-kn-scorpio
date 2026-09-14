import { solvro } from "@solvro/config/eslint";

export default await solvro({
  rules: {
    "import/named": "off",
  },
});
