import { ProfileAvatarImage } from "@/interfaces/profile";

// Cycled through in order, one step per click on the home-page avatar. The
// first entry is what renders on load.
//
// Keep every entry square: the avatar crops to a circle, so a portrait image
// would be centre-cropped and cut the face off.
export const PROFILE_AVATARS: ProfileAvatarImage[] = [
  {
    src: "/images/avatar-profile-red-prime.png",
    alt: "3D cartoon avatar of Kittipat on a deep red background",
  },
  {
    src: "/images/profile2.jpg",
    alt: "Photo of Kittipat holding his cat",
  },
];
