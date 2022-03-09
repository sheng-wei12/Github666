import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import ProgressBar from "./ProgressBar";
import { apiBusRoute, apiBusRouteStop } from "../../Api";
import { Button } from "react-bootstrap";
import { DataContext } from "../../pages/Search";
import { PopupContext } from "../../pages/Search";
import { FaLessThan } from "react-icons/fa";
import styled from "styled-components";

const StyledUl = styled.ul`
  padding-left: 1rem;
  padding-right: 1rem;
`;

const ShowRoute = ({ city, routeData, setCurrentRender }) => {
  // const [busRoute,setBusRoute] = useState([])
  // const [stopRouteData,setStopRouteData] = useState([])
  // const [arrivalTime,setArrivalTime] = useState([])

  // const [reFetch, setReFetch] = useState(false);
  const [status, setStatus] = useState("back");

  // 在這裡設定data.time 和 data.stopname 的state, 再傳到map.js 中渲染所選站牌的資訊
  // 根據 routeName 呼叫 api 取得當前路線所有站牌資訊
  const { routeName, depName, desName } = routeData;

  const { goData, setGoData, backData, setBackData } = useContext(DataContext);
  const { setActivePopup, setArrivedState } = useContext(PopupContext);

  // 地圖相關顯示
  const { map } = useContext(PopupContext);

  // function handleSetView(lat, lon) {
  //   const { current = {} } = map;
  //   const { leatletElement: map } = current;
  //   map.setView([lat, lon], 14);
  // }

  function handleFlyto(lat, lon) {
    if (map) {
      map.flyTo([lat, lon], 16, {
        duration: 2,
      });
    }
    // const { current = {} } = map;
    // const { leatletElement: map } = current;
  }

  const handleRefetch = () => {
    fetchData();
    // setReFetch(true);
  };

  const fetchData = useCallback(() => {
    let goRouteData = [];
    let backRouteData = [];
    let stopData = [];
    console.log(status);
    //看來只能先處理完第一次呼叫，再處理下一次呼叫
    async function getBus() {
      try {
        let res = await apiBusRoute(city, routeName);
        if (res.status === 200) {
          console.log(res.status);
        }
        if (status === "go") {
          console.log("go");
          goRouteData = getGoRoute(res.data);
          getRoute(goRouteData, status);
        } else if (status === "back") {
          console.log("back");
          backRouteData = getBackRoute(res.data);
          getRoute(backRouteData, status);
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function getRoute(routeData, status) {
      try {
        let res = await apiBusRouteStop(city, routeName);
        if (res === 200) {
          console.log(res.status);
        }
        if (status === "go") {
          console.log("goStops");
          stopData = getGoStop(res.data);
        } else if (status === "back") {
          console.log("backStops");
          stopData = getBackStop(res.data);
        }
        let time = 0;
        let timeText = "";
        let dataSet = [];

        stopData.forEach((stop) => {
          routeData.forEach((route) => {
            let dataObj = {};
            if (route.stopUID === stop.StopUID) {
              time = Math.floor(route.estimateTime / 60);
              // 文字顯示
              if (time === 0) {
                timeText = "進站中";
              } else if (time <= 1 && 0 < time) {
                timeText = "即將到站";
              } else if (!time) {
                timeText = "--";
              } else {
                timeText = `${time} 分鐘`;
              }
              dataObj.stopUID = stop.StopUID;
              dataObj.time = timeText;
              dataObj.stopName = stop.StopName.Zh_tw;
              dataObj.positionLon = stop.StopPosition.PositionLon;
              dataObj.positionLat = stop.StopPosition.PositionLat;
              dataSet.push(dataObj);
              // console.log(dataSet)
            }
          });
        });
        // 再來設定各種set 再帶到去返程組件渲染
        if (status === "back") {
          console.log("setback");
          setBackData(dataSet);
        } else if (status === "go") setGoData(dataSet);
      } catch (err) {
        console.error(err);
      }
    }

    const getGoStop = (stopRouteData) => {
      // 選取站數最多的為路線列表
      const GoStops = stopRouteData.filter(
        (item) => item.Direction && item.RouteName.Zh_tw === routeName
      );
      let maxStopsNum = 0;
      let stopIndex = 0;
      GoStops.forEach((item, index) => {
        if (item.Stops.length > maxStopsNum) {
          maxStopsNum = item.Stops.length;
          stopIndex = index;
        }
      });
      let stops = GoStops[stopIndex].Stops;
      // console.log(stops)
      return stops;
    };
    const getGoRoute = (busRoute) => {
      const catchData = busRoute.filter(
        (item) => item.Direction && item.RouteName.Zh_tw === routeName
      );

      let busGoData = [];

      catchData.forEach((item) => {
        busGoData.push({
          estimateTime: item.EstimateTime, //到站時間預估(秒)
          stopUID: item.StopUID, //站牌唯一識別代碼
        });
      });
      return busGoData;
    };
    const getBackStop = (stopRouteData) => {
      // 選取站數最多的為路線列表
      const backStops = stopRouteData.filter(
        (item) => !item.Direction && item.RouteName.Zh_tw === routeName
      );
      let maxStopsNum = 0;
      let stopIndex = 0;
      backStops.forEach((item, index) => {
        if (item.Stops.length > maxStopsNum) {
          maxStopsNum = item.Stops.length;
          stopIndex = index;
        }
      });
      // console.log(backStops)

      let stops = backStops[stopIndex].Stops;
      // console.log(stops)
      return stops;
    };
    const getBackRoute = (busRoute) => {
      const cachebackData = busRoute.filter(
        (item) => !item.Direction && item.RouteName.Zh_tw === routeName
      );

      let busBackData = [];

      cachebackData.forEach((item) => {
        busBackData.push({
          estimateTime: item.EstimateTime, //到站時間預估(秒)
          stopUID: item.StopUID, //站牌唯一識別代碼
        });
      });
      return busBackData;
    };
    getBus();
    // setReFetch(false);
  }, [city, routeName, setBackData, setGoData, status]);

  useEffect(() => {
    console.log("execute function in useEffect");
    fetchData();
  }, [fetchData]);

  // useEffect(() => {
  //   localStorage.setItem("goData", JSON.stringify(goData))
  // }, [goData]);

  // useEffect(() => {
  //   localStorage.setItem("backData", JSON.stringify(backData))
  // }, [backData]);
  // 先在dependencies 這裡確定要儲存的goData 和 bakcData, 要先JSON.stringfy
  // 再到一開始 useState的地方取得 parse後的 data

  // 在這裡處理非同步回傳的資料
  // useEffect(() => {
  //     console.log(busRoute)
  //     console.log(stopRouteData)
  //     // getBackRoute()
  // },[busRoute,stopRouteData])

  // 再配合即時路線資訊渲染到站時間
  // console.log(maxStopsNum, stopIndex)
  // let stop = Math.max.apply(Math, stopRouteBack.map((route) => route.Stops.length))

  return (
    <div className="key-word-search">
      <button
        type="button"
        className="btn"
        value="返回搜尋"
        onClick={() => {
          setCurrentRender("Insearch");
        }}
      >
        <FaLessThan className="me-1" />
        返回搜尋
      </button>
      <h1>{routeName}</h1>
      <SearchNav
        depName={depName}
        desName={desName}
        setStatus={setStatus}
        fetchData={fetchData}
      />
      <StyledUl className="overflow-auto show-route-result">
        {status === "back" &&
          backData &&
          backData.map((data) => (
            <li
              className="d-flex display-row"
              key={data.stopUID}
              onClick={() => {
                data.time === "進站中"
                  ? setArrivedState("popup-arrived")
                  : data.time === "即將到站"
                  ? setArrivedState("popup-arriving")
                  : setArrivedState("popup-other");
                setActivePopup(data);
                handleFlyto(data.positionLat, data.positionLon);
              }}
            >
              <p
                className={
                  data.time === "進站中" || data.time === "即將到站"
                    ? "bus-arriving"
                    : data.time === "--"
                    ? "bus-not-depart"
                    : "bus-arrival-time"
                }
              >
                {data.time}
              </p>
              {data.stopName}
            </li>
          ))}
        {status === "go" &&
          goData &&
          goData.map((data) => (
            <li
              className="d-flex display-row"
              key={data.stopUID}
              onClick={() => {
                data.time === "進站中"
                ? setArrivedState("popup-arrived")
                : data.time === "即將到站"
                ? setArrivedState("popup-arriving")
                : setArrivedState("popup-other");
                setActivePopup(data);
                handleFlyto(data.positionLat, data.positionLon);
              }}
            >
              <p
                className={
                  data.time === "進站中" || data.time === "即將到站"
                    ? "bus-arriving"
                    : data.time === "--"
                    ? "bus-not-depart"
                    : "bus-arrival-time"
                }
              >
                {data.time}
              </p>
              {data.stopName}
            </li>
          ))}
      </StyledUl>
      <Update fetchData={fetchData} />

      {/* <div className="dialogue d-flex flex-column align-items-center">
        <img src={busIcon} alt="" />
        <div className="stop-name">葦名城 主城</div>
        <div className="stop-time">進站中</div>
      </div> */}
    </div>
  );
};

const SearchNav = ({ depName, desName, setStatus, fetchData }) => {
  //不用useRef 好像也沒關係
  const statusValue = useRef(null);
  const handleSelectRoute = (e) => {
    setStatus(e.target.value);
    console.log(statusValue.current);
    fetchData();
  };
  return (
    <>
      <Button
        variant="serach-nav"
        type="button"
        value="back"
        ref={statusValue}
        onClick={handleSelectRoute}
      >
        往{desName}
      </Button>
      <Button
        variant="serach-nav"
        type="button"
        value="go"
        ref={statusValue}
        onClick={handleSelectRoute}
      >
        往{depName}
      </Button>
    </>
  );
};

let interval = undefined;

const Update = ({ fetchData }) => {
  //進度條
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  //倒數計時
  const time = 30;
  const [remainSecond, setRemainSecond] = useState(0);
  const [countDownSecond, setCountDownSecond] = useState(time);

  useEffect(() => {
    setRunning(true);
    const startTime = Date.now();

    if (running) {
      interval = setInterval(() => {
        // 進度條量條
        setProgress((prev) => prev + 1);
        // 計算剩餘秒數
        const pastSeconds = parseInt((Date.now() - startTime) / 1000);
        const remain = countDownSecond - pastSeconds;
        setRemainSecond(remain < 0 ? 0 : remain);
      }, 300);
    } else {
      clearInterval(interval);
    }
  }, [countDownSecond, running]);

  useEffect(() => {
    if (progress === 100) {
      setRunning(false);
      setProgress(0);
      setCountDownSecond(time);
      clearInterval(interval);
    }
  }, [progress]);

  // useEffect(() => {
  //   if (progressRef.current) {
  //     progressRef.current.animate();
  //   }
  // }, [progresssValue]);

  return (
    <>
      {/* <div className="progress-bar-container">
        <div className="progress-bar"></div>
      </div> */}
      <ProgressBar progress={progress} />
      <div className="d-flex justify-content-between text-align-center">
        <p className="">{remainSecond}秒後更新</p>
        <button
          className="btn"
          type="button"
          value="立即更新"
          onClick={() => {
            setRunning(false);
            setProgress(0);
            setCountDownSecond(time);
            fetchData();
          }}
        >
          立即更新
        </button>
      </div>
    </>
  );
};

export default ShowRoute;
