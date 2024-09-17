

"use client";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { Center } from "@repo/ui/center";
import { p2pTranster } from "../app/lib/actions/p2pTransfer";

export const SendMoney = () => {


    const [number,setNumber] = useState('')
  const [amount,setAmount] = useState(0);
  return (
    <div className="h-[90vh]">
        <Center >
    <Card title="Send Money">
      <div className="min-w-72 pt-2">
        <TextInput
          label={"receiver"}
          placeholder={"receiver"}
          onChange={(value) => {
            setNumber(value)
          }}
        />
           <TextInput
          label={"Amount"}
          placeholder={"Amount"}
          onChange={(value) => {
            setAmount(Number(value))
          }}
        />

        <div className="flex justify-center pt-4">
          <Button
            onClick={async() => {
                await p2pTranster(number,amount*100)
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
    </Center>
    </div>
  );
};
