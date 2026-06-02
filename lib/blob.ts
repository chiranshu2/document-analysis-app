import { access } from "fs";
import {put,del} from '@vercel/blob'
  export async function uploadToBlob(
 file:File,
 organizationId:string,
userId:string):Promise<{url:string;pathname:string}>
 {

try {
    const filename = `${Date.now()}-${file.name.replace(/\s+/g,"-")}`;
const pathname = `${organizationId}/${userId}/${filename}`;
const blob=await put(pathname,file,{
    access:"public",
    token:process.env.BLOB_READ_WRITE_TOKEN
})
return{
    url:blob.url,
    pathname:blob.pathname
}
} catch (error) {
    console.error('Blob upload error',error)
    throw Error("Failed to upload a file")
}
 }
 export async function deleteFromBlob(url:string):Promise<void>{
    try {
        await del(url,{
            token:process.env.BLOB_READ_WRITE_TOKEN
        })
        
    } catch (error) {
         console.error('Blob delete error',error)
    throw Error("Failed to upload a file")
    }
 }