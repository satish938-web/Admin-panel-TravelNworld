/**
 * Sanitizes a string to be used as a safe folder or file name in S3.
 * Converts to lowercase, trims, replaces spaces with hyphens, and removes special characters.
 */
export const sanitize = (str) => {
  return (str || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/[^\w.-]+/g, "") // remove non-alphanumeric except . and -
    .replace(/--+/g, "-"); // collapse multiple hyphens
};

/**
 * Generates standardized S3 folder paths for different media types.
 */
export const getS3Path = {
  agentProfile: (agentName) => `agents/${sanitize(agentName)}/profile`,
  agentBanner: (agentName) => `agents/${sanitize(agentName)}/banner`,
  agentGallery: (agentName) => `agents/${sanitize(agentName)}/gallery`,
  agentVideos: (agentName) => `agents/${sanitize(agentName)}/videos`,
  agentTestimonials: (agentName) => `agents/${sanitize(agentName)}/testimonials`,
  agentReviews: (agentName) => `agents/${sanitize(agentName)}/reviews/public`,
  
  siteTestimonials: (title) => `testimonials/site/${sanitize(title)}`,
  siteGallery: (title) => `gallery/site/${title ? sanitize(title) : "general"}`,
  
  itinerary: (agentName, title) => {
    const agentPart = agentName ? sanitize(agentName) : "admin";
    const titlePart = sanitize(title) || "untitled-package";
    return `itineraries/${agentPart}/${titlePart}`;
  },
  
  destination: (name) => `destinations/${sanitize(name)}`,
  city: (destinationName, cityName) => `destinations/${sanitize(destinationName)}/cities/${sanitize(cityName)}`,
  
  blog: (agentName, title) => {
    const agentPart = agentName ? sanitize(agentName) : "superadmin";
    const titlePart = title ? sanitize(title) : "featured";
    return `blogs/${agentPart}/${titlePart}`;
  },
  
  banner: (section, title) => {
    const sectionPart = sanitize(section).replace(/-/g, "_"); // User requested home_top_banner style
    const titlePart = title ? `/${sanitize(title)}` : "";
    return `banner/${sectionPart}${titlePart}`;
  },
  
  video: (section, title) => {
    const sectionPart = sanitize(section).replace(/-/g, "_");
    const titlePart = title ? `/${sanitize(title)}` : "";
    return `videos/${sectionPart}${titlePart}`;
  },
  
  general: (folder) => `uploads/${sanitize(folder)}`
};
