import { useEffect, useState } from "react";
import { Link, useParams, json, redirect, useNavigate } from "react-router-dom";

import BasicModal from "../components/BasicModal";
import QesCardTwo from "../components/QesCardTwo";
import QesCard from "../components/QesCard";
import ExtraQus from "../components/ExtraQus";

import { tokenLoader } from "../utlis/auth";
import {
  parseGroupsConflict,
  reverseParseGroupsConflict,
} from "../utlis/parsing";
import { ConflictMessageFunc } from "../utlis/conflictsCheck";

import {
  Warpper,
  GroupName,
  ButtonContainer,
  BackButton,
} from "./GroupRatingsStyles";
import ConflictMessage from "./ConflictMessage";

const GroupRatings = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState();
  const [crowdRatingsData, setCrowdRatingsData] = useState();
  const [groupRatingsData, setGroupRatingsData] = useState();
  const [otherQuestionsData, setOtherQuestionsData] = useState({});
  const [isConflict, setIsConflict] = useState(false);
  const [dataConflict, setDataConflict] = useState();
  const [questions, setQuestions] = useState(["hey", "roi", "yoni"]);
  const [modalToggle, setModalToggle] = useState(false);
  const [modalText, setModalText] = useState();

  // const titles = ["גרוע", "לא טוב", "בינוני", "טוב", "מצוין"];

  useEffect(() => {
    const getGroupData = async () => {
      const token1 = tokenLoader();
      const baseURL = "http://127.0.0.1:5000/";
      const groupNum = params.groupId;
      let groupResData;
      let groupRes = await fetch(`${baseURL}/rate?group_number=${groupNum}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token1,
        },

        // body: JSON.stringify({ group_number: groupNumInt }),
      });

      if (groupRes.status === 422 || groupRes.status === 401) {
        return groupRes;
      }
      if (!groupRes.ok) {
        throw json(
          { message: "Could not authenticate user." },
          { status: 500 }
        );
      }
      groupResData = await groupRes.json();
      console.log(groupResData.data);
      setGroupData(groupResData.data);
    };
    getGroupData();
  }, [params.groupId]);

  const isConflicToggle = () => {
    setIsConflict(false);
    navigate("/");
  };

  const groupDataHandler = (rating, crowdRatings) => {
    // console.log(rating, crowdRatings);
    setGroupRatingsData(rating);
    setCrowdRatingsData(crowdRatings);
  };

  const otherQuestionsHandler = (questionNumber, rating) => {
    let otherQuestionsTemp = otherQuestionsData;
    otherQuestionsTemp[questionNumber] = rating;
    setOtherQuestionsData({ ...otherQuestionsTemp });
  };

  const validateGroupRating = () => {
    const totalRating = Object.values(crowdRatingsData).reduce(
      (acc, curr) => acc + curr,
      0
    );
    if (totalRating === 100) submitHandler();
    else if (totalRating > 100) {
      //TODO: CREATE POPUP FOR RATING FAIL
      setModalToggle(true);
      setModalText("Your numbers sum up is over 100. Please fix.");

      // alert("Your numbers sum up is over 100. Please fix.");
    } else {
      setModalToggle(true);
      setModalText("Your numbers don't sum up to 100. Please fix.");

      // alert("Your numbers don't sum up to 100. Please fix.");
    }
  };

  const submitHandler = async () => {
    setIsConflict(false);
    const tok = tokenLoader();
    const ratingBody = {
      data: {
        group_number: parseInt(params.groupId),
        rate: groupRatingsData,
        crowd_ratings: crowdRatingsData,
        answer: otherQuestionsData,
      },
    };
    console.log(ratingBody);
    const baseURL = "http://127.0.0.1:5000/";
    // TODO: save base url in constants and import
    let res = await fetch(baseURL + "rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + tok,
      },
      body: JSON.stringify(ratingBody),
    });
    if (res.status === 422 || res.status === 401) {
      return res;
    }
    if (!res.ok) {
      throw json({ message: "Could not authenticate user." }, { status: 500 });
    }
    const resData = await res.json();
    console.log(resData);
    if (resData.ranking) {
      console.log(5464646);
      setIsConflict(true);
      setDataConflict(resData?.data?.rank_list);
    } else {
      return navigate("/");
    }
  };
  console.log(groupData);
  return (
    <Warpper>
      {modalToggle && <BasicModal text={modalText} close={setModalToggle} />}
      {isConflict && (
        <ConflictMessage
          groups={dataConflict}
          currentGroup={params.groupId}
          groupRatingsData={groupRatingsData}
          isConflicToggle={isConflicToggle}
          groupName={groupData?.group_name}
        />
      )}
      {!isConflict && (
        <>
          <GroupName>
            Team: {params?.groupId} {groupData?.group_name}
          </GroupName>
          <QesCard
            userEvaluation={true}
            question={"How do you think others will evaluate?"}
            rankHandler={groupDataHandler}
            otherRatings={true}
          />
          {groupData?.questions &&
            Object.keys(groupData?.questions).map((questionNum) => {
              return (
                <ExtraQus
                  questionNum={questionNum}
                  question={"dsadsadsd"}
                  rankHandler2={otherQuestionsHandler}
                />
              );
            })}
          <ButtonContainer>
            <BackButton>
              <input
                onClick={() => validateGroupRating()}
                type="submit"
                value="Submit"
              />
            </BackButton>
            <BackButton>
              <Link to="..">Back</Link>
            </BackButton>
          </ButtonContainer>
        </>
      )}
    </Warpper>
  );
};

export default GroupRatings;
