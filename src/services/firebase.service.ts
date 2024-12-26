import { firebaseStorage as storage } from "../configs/firebase.config";

export const uploadImageFile = async (imageFile: Express.Multer.File, name: string | undefined, id: number | undefined, type: string | undefined) => {
  const date = new Date(Date.now());
  const fileName = `${type}/${name?.split(" ").join("-")}-${id}/${date.toISOString().split("T").shift()}.${imageFile.mimetype.split("/").pop()}`;
  const storageRef = storage.bucket().file(fileName);
  const metadata = {
    contentType: `${imageFile.mimetype}`,
  };

  await storageRef.save(imageFile.buffer, metadata);
  console.log(`Uploaded ${fileName} to Firebase Storage.`);
  return `https://storage.googleapis.com/${storage.bucket().name}/${fileName}`;
};
