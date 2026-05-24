// Déclaration pour les imports de CSS modules (utilisés par les composants web)
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
