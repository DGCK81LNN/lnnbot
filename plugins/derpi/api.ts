import { GetImageResponse } from "./types"
import ErrorWrapper from "../error-wrapper"
import fs from "fs"
import path from "path"
import Stream from "stream"
import axios from "axios"

async function loadImageMetadata(id: number) {
  var url = `https://derpibooru.org/api/v1/json/images/${id}`

  try {
    var metaResponse = await axios.get<GetImageResponse>(url)
  } catch (err) {
    throw new ErrorWrapper([".metadata-error"], err)
  }
  return metaResponse.data.image
}

export async function loadImage(id: number) {
  var outPath = path.resolve(`./.lnnbot_cache/${id}`).replace(/^\//, "")

  try {
    await fs.promises.lstat(outPath)
    return
  } catch {}

  await fs.promises.mkdir(path.dirname(outPath), { recursive: true })

  var meta = await loadImageMetadata(id)
  if (meta.hidden_from_users === true) throw new ErrorWrapper([".is-removed"])
  if (meta.mime_type.startsWith("video/")) throw new ErrorWrapper([".is-video"])

  try {
    var imgResponse = await axios.get(meta.representations.small, {
      responseType: "stream",
    })
  } catch (err) {
    throw new ErrorWrapper([".image-error"], err)
  }

  var imgStream = imgResponse.data
  await Stream.promises.pipeline(imgStream, fs.createWriteStream(outPath))
}
