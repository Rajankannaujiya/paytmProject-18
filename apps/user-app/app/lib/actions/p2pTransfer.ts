"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";


export async function  p2pTranster(to:string, amount:Number) {

    const session = await getServerSession(authOptions);

    const sender = session?.user.id;
    
    if(!sender){
        return {
            message: "sender is not there"
        }
    }

    const receiver = await prisma.user.findFirst({
        where:{
            number:to
        }
    })

    if(!receiver){
        return {
            message: "receiver is not found"
        }
    }

    await prisma.$transaction(async(tx)=>{
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId"= ${Number(sender)} FOR UPDATE`;
        const fromuser= await tx.balance.findUnique({
            where:{
                userId:Number(sender)
            }
        });

        if(!fromuser || fromuser.amount < Number(amount)){
            throw new Error("Insufficient balance");
        }

        await tx.balance.update({
            where:{
                userId: Number(sender)
            },
            data:{
                amount:{
                    decrement:Number(amount)
                }
            }
        })

        await tx.balance.update({
            where:{
                userId: receiver.id
            },
            data:{
                amount:{
                    increment:Number(amount)
                }
            }
        })

        await tx.p2pTransfer.create({
            data:{
                fromUserId:Number(sender),
                toUserId:Number(receiver.id),
                amount:Number(amount),
                timestamp:new Date()
            }
        })
    })
}