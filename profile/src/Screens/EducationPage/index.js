import React from "react";
import Timeline from "@material-ui/lab/Timeline";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import TimelineConnector from "@material-ui/lab/TimelineConnector";
import TimelineContent from "@material-ui/lab/TimelineContent";
import TimelineDot from "@material-ui/lab/TimelineDot";
import TimelineOppositeContent from "@material-ui/lab/TimelineOppositeContent";
import Typography from "@material-ui/core/Typography";
import { Flag } from "@material-ui/icons";

export default function OppositeContentTimeline({ isEnglish }) {
  const listEducation = [
    {
      label: isEnglish ? "Primary School" : "ป.1-6",
      place: isEnglish ? "Mueang Mai Wittaya School" : "โรงเรียนเมืองใหม่วิทยา",
    },
    {
      label: isEnglish ? "Secondary School" : "ม.1 - 3",
      place: isEnglish ? "Mueang Mai Wittaya School" : "โรงเรียนเมืองใหม่วิทยา",
    },
    {
      label: isEnglish ? "High School" : "ม.4 - 6",
      place: isEnglish
        ? "Si Bun Rueang Wittayakran School"
        : "โรงเรียนศรีบุญเรืองวิทยาคาร",
    },
    {
      label: isEnglish ? "Bachelor Degrees" : "ป.ตรี",
      place: isEnglish ? "Khon Kaen University" : "มหาวิทยาลัยขอนแก่น",
    },
  ];
  return (
    <Timeline align="alternate" style={{ padding: 0 }}>
      {listEducation.map((item, key) => {
        const isEven = key % 2 == 0 ? true : false;
        return (
          <div key={key}>
            <TimelineItem>
              <TimelineOppositeContent>
                <Typography style={{ color: !isEven && "#777" }}>
                  {isEven ? item.place : item.label}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                {key === listEducation.length - 1 ? null : (
                  <TimelineConnector />
                )}
              </TimelineSeparator>
              <TimelineContent style={{ color: isEven && "#777" }}>
                <Typography>{!isEven ? item.place : item.label}</Typography>
              </TimelineContent>
            </TimelineItem>
          </div>
        );
      })}
    </Timeline>
  );
}
