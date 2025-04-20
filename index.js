const express = require("express")
const app = express()
const cors = require("cors")
const { Sequelize } = require("sequelize")
const io = require("socket.io")

const sequelize = new Sequelize("login_qr_socket","postgres","0psqlpassword0",{
    host:"localhost",
    dialect:"postgres"
})

const Users = sequelize.define("Users",{
    id:{
        type:DataTypes.INT,
        primaryKey:true,
        autoIncrement:true
    },
    username:{
        type:DataTypes.CHAR(10),
    },
    password:{
        type:DataTypes.CHAR(10),
    }
})

const QR = sequelize.define("QRCode",{
    qrcode:{
        type:DataTypes.CHAR(10),
    }
})

sequelize.sync().then().catch(e=>console.error(e))

io.on("connection",(socket)=>{
    socket.emit("login-success","success login")
})

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

app.get("/api/qrcode/new",async(req,res)=>{
    try {
        await QR.destroy()
        await QR.create({
            qrcode:Array.from({length: 10}, () => Math.random().toString(36)[2]).join('')
        })
        return res.status(200).send("OK")
    } catch (error) {
        console.error("error getqr",error)
        return res.status(500).json()
    }
})

app.post("/api/user/new",async(req,res)=>{
    try {
        await Users.destroy()
        await Users.create({
            username:"username",
            password:"12345678"
        })

        return res.status(200).send("OK")
    } catch (error) {
        console.error("error user new")
        return res.status(500).json()
    }
})

app.post("/api/login",async(req,res)=>{
    try {
        const { username,password } = req.body
        const user = await Users.findOne({
            where:{
                username,password
            }
        })

        if (!user) {
            return res.status(400).json()
        }

        await QR.destroy()
        await QR.create({
            qrcode:Array.from({length: 10}, () => Math.random().toString(36)[2]).join('')
        })

        return res.status(200).send("OK")
    } catch (error) {
        console.error("error login",error)
        return res.status(500).json()
    }
})

app.listen(3212)