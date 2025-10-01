export type Branding = {
  name: string;
  tagline: string;
  colors: {
    primary: string;
    accent: string;
    background?: string;
    surface?: string;
  };
  logo: string; // path under public/
};

const branding: Branding = {
  name: "Sai Saran OS",
  tagline: "Frontend + AI-driven experiences",
  colors: {
    primary: "#E10600", // Batman red
    accent: "#121212",
    background: "#000000",
    surface: "#111111",
  },
  logo: "/batman.png",
};

export default branding;
