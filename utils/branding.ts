export type Branding = {
  colors: {
    accent: string;
    background?: string;
    primary: string;
    surface?: string;
  };
  logo: string;
  name: string;
  tagline: string; // path under public/
};

const branding: Branding = {
  colors: {
    // Batman red
accent: "#121212", 
    background: "#000000",
    primary: "#E10600",
    surface: "#111111",
  },
  logo: "/batman.png",
  name: "Sai Saran OS",
  tagline: "Frontend + AI-driven experiences",
};

export default branding;
