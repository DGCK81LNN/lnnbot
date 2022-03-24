import { Random } from "koishi"
import { GetImageResponse, Image, SearchImagesResponse } from "./types"
import ErrorWrapper from "../error-wrapper"
import fs from "fs"
import path from "path"
import Stream from "stream"
import axios from "axios"

type Params = string | [string, string][] | Record<string, string> | URLSearchParams

async function apiCall<T>(path: string, params: Params) {
  var url = `https://derpibooru.org/api/v1/json/${path}`
  var paramStr = new URLSearchParams(params).toString()
  if (paramStr) url += (url.includes("?") ? "&" : "?") + paramStr
  return (await axios.get<T>(url)).data
}

export async function loadImageMetadata(id: number, options: {}) {
  try {
    var meta = await apiCall<GetImageResponse>(`images/${id}`, options)
  } catch (err) {
    throw new ErrorWrapper([".metadata-error"], err)
  }
  return meta.image
}

export interface LoadedImage {
  id: number
  outPath: string
}

export function loadImage(id: number, options?: {}): Promise<LoadedImage>
export function loadImage(meta: Image): Promise<LoadedImage>
export async function loadImage(
  param: number | Image,
  options?: {}
): Promise<LoadedImage> {
  if (typeof param === "number") var id = param
  else var id = param.id

  var outPath = path.resolve(`./.lnnbot_cache/${id}`)

  try {
    await fs.promises.lstat(outPath)
    return { id, outPath }
  } catch {}

  await fs.promises.mkdir(path.dirname(outPath), { recursive: true })

  if (typeof param === "number") var meta = await loadImageMetadata(param, options)
  else var meta = param

  if (meta.hidden_from_users === true) throw new ErrorWrapper([".is-removed"])
  if (meta.mime_type.startsWith("video/")) throw new ErrorWrapper([".is-video"])

  try {
    var imgResponse = await axios.get(meta.representations.large, {
      responseType: "stream",
    })
  } catch (err) {
    throw new ErrorWrapper([".image-error"], err)
  }

  var imgStream = imgResponse.data
  await Stream.promises.pipeline(imgStream, fs.createWriteStream(outPath))

  return { id: meta.id, outPath }
}

export async function getRandomImage(options: {}) {
  options = Object.assign(
    {
      sf: `random:${Random.int(0, 0x100000000)}`,
      sd: "desc",
    },
    options
  )
  try {
    var result = await apiCall<SearchImagesResponse>("search/images", options)
  } catch (err) {
    throw new ErrorWrapper([".metadata-error"], err)
  }

  if (result.images.length === 0) throw new ErrorWrapper([".no-result"])
  var meta = result.images[0]

  return await loadImage(meta)
}
