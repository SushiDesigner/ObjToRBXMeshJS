const OBJFile = require("obj-file-parser")

const fs = require("fs")

const objContents = fs.readFileSync("convert.obj", "utf8")
console.time("time")
objToRBXMesh(objContents)

function objToRBXMesh(obj) {
  let robloxMesh = {
    vertices: [],
  }

  function insertVertex(vx, vy, vz, nx, ny, nz, tu, tv, tw) {
    let vertex = {
      vx,
      vy,
      vz,
      nx,
      ny,
      nz,
      tu,
      tv,
      tw,
    }
    robloxMesh.vertices.push(vertex)
  }

  const objFile = new OBJFile(obj)
  const data = objFile.parse(objFile)

  for (const objFace of data.models[0].faces) {
    for (const objVertex of objFace.vertices) {
      const vertexIndex = objVertex.vertexIndex - 1
      const vertexNormalIndex = objVertex.vertexNormalIndex - 1
      const textureCoordsIndex = objVertex.textureCoordsIndex - 1

      insertVertex(
        data.models[0].vertices[vertexIndex].x,
        data.models[0].vertices[vertexIndex].y,
        data.models[0].vertices[vertexIndex].z,

        data.models[0].vertexNormals[vertexNormalIndex].x,
        data.models[0].vertexNormals[vertexNormalIndex].y,
        data.models[0].vertexNormals[vertexNormalIndex].z,

        data.models[0].textureCoords[textureCoordsIndex].u,
        data.models[0].textureCoords[textureCoordsIndex].v
      )
    }
  }

  console.log("Vertices " + data.models[0].vertices.length)
  console.log("Faces " + data.models[0].faces.length)

  const out = fs.createWriteStream("converted.mesh")

  objToRBXMeshWrite(out, robloxMesh, data.models[0].faces.length)

  out.end()

  console.timeEnd("time")
}

function objToRBXMeshWrite(stream, robloxMesh, faceCount) {
  let scale = 2

  stream.write("version " + "1.00" + "\n")
  stream.write(faceCount + "\n")

  for (const vert of robloxMesh.vertices) {
    stream.write("[")
    stream.write(vert.vx * scale + ",")
    stream.write(vert.vy * scale + ",")
    stream.write(vert.vz * scale + "]")

    stream.write("[")
    stream.write(vert.nx + ",")
    stream.write(vert.ny + ",")
    stream.write(vert.nz + "]")

    stream.write("[")
    stream.write(vert.tu + ",")
    stream.write(vert.tv + ",")
    stream.write("0]")
  }
}
