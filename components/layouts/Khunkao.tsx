import { getCount } from "@/app/services/count";
import { environment } from "@/core/environment";
import { Card, Image, Input } from "@nextui-org/react";
import clsx from "clsx";
import { AES } from "crypto-js";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { FaCircleChevronRight } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";
import { MdEdit } from "react-icons/md";

const KhunKao: React.FC = () => {
  const [isShow, setIsShow] = React.useState(false);
  const [isSavedName, setIsSavedName] = React.useState<boolean>(false);
  const [name, setName] = React.useState("");

  const onChangeName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> &
    ((e: KeyboardEvent) => void) = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  const onSubmit = async () => {
    if (!window.localStorage) return;
    const oldName = window.localStorage.getItem("name");
    if (oldName === name) {
      setIsSavedName(true);
      window.localStorage.setItem("saved-name", "1");
      return;
    }
    window.localStorage.setItem("name", name);
    window.localStorage.setItem("saved-name", "0");
    const encryptName = AES.encrypt(
      name || "",
      environment.secretKey,
    ).toString();
    const res = await getCount(encryptName);
    if (res.savedName) {
      if (!window.localStorage) return;
      setIsSavedName(true);
      window.localStorage.setItem("saved-name", "1");
    }
  };

  useEffect(() => {
    if (!window.localStorage) return;
    const sName = window.localStorage.getItem("saved-name");
    const name = window.localStorage.getItem("name");
    const nextTimeKhunkao = localStorage.getItem("nextTimeKhunkao");
    if (sName && name) {
      setIsSavedName(sName === "1");
      setName(name || "");
    }
    setIsShow(
      !sName ||
        nextTimeKhunkao === null ||
        dayjs().isAfter(dayjs(nextTimeKhunkao)),
    );
  }, []);

  if (!isShow) return null;
  return (
    <div className="fixed bottom-4 right-4">
      <div className="relative">
        <Image
          src="./images/khunkao.png"
          alt="Khun Kao"
          className="w-20 scale-x-[-1]"
        />
        <Card
          isBlurred
          className="w-fit absolute top-[-24px] right-[24px] rounded-xl "
        >
          <div className="relative p-6 pr-16 pb-4 flex flex-col gap-1">
            <div className={clsx(isSavedName ? "w-32" : "w-44")}>
              {isSavedName ? "Hi!, How are you?" : "What is your name?"}
            </div>
            {isSavedName ? (
              <div className="pl-4 text-lg text-bold gap-2 items-center flex">
                <span>{name}</span>
                <MdEdit
                  className="cursor-pointer text-base"
                  onClick={() => setIsSavedName(false)}
                />
              </div>
            ) : (
              <Input
                size="sm"
                placeholder="Enter your name pls."
                endContent={
                  <FaCircleChevronRight
                    className="cursor-pointer"
                    onClick={onSubmit}
                  />
                }
                onChange={onChangeName}
                defaultValue=""
                onKeyDown={handleKeyDown}
                value={name}
              />
            )}

            {isSavedName && (
              <IoMdCloseCircle
                className="absolute top-1 right-1 cursor-pointer text-lg"
                onClick={() => {
                  setIsShow(false);
                  window.localStorage.setItem(
                    "nextTimeKhunkao",
                    dayjs().add(1, "hour").toString(),
                  );
                }}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default KhunKao;
