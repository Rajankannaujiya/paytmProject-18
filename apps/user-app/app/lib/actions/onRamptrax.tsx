"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";


export async function createOnRampTransaction(amount:number, provider:string){

    const session = await getServerSession(authOptions);
    // in real world it will be real token; but for now set it to math.random()

    //  const token = await axios.get('https://api.hdfcbank.com/getToken,{
    // amount:200})
    const token = Math.random().toString();
    const userId = session.user.id;

    if(!userId){
        return {
            message: "User is not loggin"
        }
    }

    await prisma.onRampTransaction.create({
        data:{
            status:"Processing",
            token:token,
            provider:provider,
            amount :amount,
            startTime:new Date(),
            userId : Number(userId), 
        }
    })

}