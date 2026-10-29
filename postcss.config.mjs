/**
 * Tailwind CSS v4 en PostCSS.
 * Le plugin `@tailwindcss/vite` fourni par le paquet `@tailwindcss/vite` n'est pas
 * appliqué par le bundler de cette version de Vite dans cet environnement ;
 * ce plan B officiel produit exactement le même CSS. Voir docs/INSTALLATION.md.
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
