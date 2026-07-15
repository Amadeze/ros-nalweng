const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('f:/Roastery Operating System/ros-app/src/app/tenant/[subdomain]/_components/TenantPortalClient.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Insert getAnimVariants and sectionAnim
const injectionPoint = `  const isDark = themeMode === "dark";`;
const injectionCode = `  const isDark = themeMode === "dark";
  const animationDirection = (tenant as any).animationDirection || "up";

  const getAnimVariants = (style: string, dir: string): Variants => {
    if (style === "none") return { hidden: {}, visible: {} };
    
    let xOffset = 0;
    let yOffset = 0;
    
    if (dir === "up") yOffset = 60;
    if (dir === "down") yOffset = -60;
    if (dir === "left") xOffset = 60;
    if (dir === "right") xOffset = -60;

    let transitionConfig: any = { duration: 0.8, ease: [0.16, 1, 0.3, 1] };
    
    if (style === "bouncy") transitionConfig = { type: "spring", bounce: 0.6, duration: 1.2 };
    if (style === "fast") transitionConfig = { duration: 0.4, ease: "easeOut" };
    if (style === "float") transitionConfig = { duration: 1.5, ease: "easeInOut" };
    if (style === "spring") transitionConfig = { type: "spring", stiffness: 120, damping: 14 };
    if (style === "cinematic") transitionConfig = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] };
    if (style === "staggered") transitionConfig = { duration: 0.6, staggerChildren: 0.2 };
    
    return {
      hidden: { 
        opacity: 0, 
        x: xOffset, 
        y: yOffset, 
        scale: style === "cinematic" ? 0.9 : 1, 
        filter: style === "cinematic" ? "blur(12px)" : "blur(0px)" 
      },
      visible: { 
        opacity: 1, 
        x: 0, 
        y: 0, 
        scale: 1, 
        filter: "blur(0px)", 
        transition: transitionConfig 
      }
    };
  };

  const sectionAnim = {
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-50px" },
    variants: getAnimVariants(animationStyle, animationDirection)
  };

  const headerAnim = {
    initial: "hidden",
    animate: "visible",
    variants: getAnimVariants(animationStyle, animationDirection)
  };`;

if (content.includes(injectionPoint) && !content.includes('getAnimVariants')) {
  content = content.replace(injectionPoint, injectionCode);
}

// 2. Replace <section and </section> with <motion.section {...sectionAnim}
// We only want to do this inside the render blocks.
// Wait, regex might be tricky if some sections have multiline attributes.
// Let's do a simple regex: `<section` -> `<motion.section {...sectionAnim}`
// And `</section>` -> `</motion.section>`
// BUT we also want to animate headers: `<header` -> `<motion.header {...headerAnim}` and `</header>` -> `</motion.header>`

content = content.replace(/<section/g, '<motion.section {...sectionAnim}');
content = content.replace(/<\/section>/g, '</motion.section>');

content = content.replace(/<header/g, '<motion.header {...headerAnim}');
content = content.replace(/<\/header>/g, '</motion.header>');

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Animations injected successfully!");
