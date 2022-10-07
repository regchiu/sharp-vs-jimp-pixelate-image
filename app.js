const jimp = require('jimp')
const jpeg = require('jpeg-js')
const sharp = require('sharp')
const path = require('path')

const regions = [
  { x: 975, y: 672, width: 918, height: 967 },
  { x: 1245, y: 2220, width: 1384, height: 811 },
  { x: 2679, y: 909, width: 745, height: 778 },
]

async function pixelateImageByJimp(imagePath) {
  try {
    jimp.decoders['image/jpeg'] = (data) =>
      jpeg.decode(data, {
        maxMemoryUsageInMB: 1024,
      })
    const image = await jimp.read(imagePath)
    for (const region of regions) {
      image.pixelate(20, region.x, region.y, region.width, region.height)
    }
    image.write(
      `./images/${path.basename(imagePath, '.jpeg')}-pixelated-by-jimp.jpg`
    )
  } catch (error) {
    console.log(`${path.basename(imagePath)} error:\n`, error)
  }
}

async function pixelateImageBySharp(imagePath) {
  try {
    const images = []
    for (const region of regions) {
      images.push({
        input: await sharp(
          await sharp(imagePath)
            .extract({
              left: region.x,
              top: region.y,
              width: region.width,
              height: region.height,
            })
            .resize(80, null, {
              kernel: sharp.kernel.nearest,
            })
            .png()
            .toBuffer()
        )
          .resize(region.width, null, {
            kernel: sharp.kernel.nearest,
          })
          .jpeg()
          .toBuffer(),
        left: region.x,
        top: region.y,
      })
    }
    await sharp(imagePath)
      .composite(images)
      .jpeg()
      .toFile(
        `./images/${path.basename(imagePath, '.jpeg')}-pixelated-by-sharp.jpg`
      )
  } catch (error) {
    console.log(`${path.basename(imagePath)} error:\n`, error)
  }
}

pixelateImageByJimp('./sample.jpeg')
pixelateImageByJimp('./sample2.jpeg')

pixelateImageBySharp('./sample.jpeg')
pixelateImageBySharp('./sample2.jpeg')
