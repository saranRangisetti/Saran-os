declare module "public/.index/*.json" {
  const value: unknown;
  export default value;
}

declare module "*.json" {
  const value: unknown;
  export default value;
}
