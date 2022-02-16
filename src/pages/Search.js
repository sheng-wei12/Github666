import React, { useState, useEffect, useCallback, useContext } from "react";
import Insearch from "../components/Search/Insearch.js";
import ShowRoute from "../components/Search/ShowRoute.js";
import Map from "../components/Search/Map.js";
import { CityContext } from "../components/Search/CityContext";
import { apiBusCity } from "../Api.js";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [busData, setBusData] = useState(() => {
    const saveBusData = localStorage.getItem("busData");
    const initBusData = JSON.parse(saveBusData);
    return initBusData || [];
  });
  
  // localStorage存 Object 要再查看看對不對
  const [routeData, setRouteData] = useState(() => {
    const saveRouteData = localStorage.getItem("routeData");
    const initRouteData = JSON.parse(saveRouteData);
    // 出發和目的地會取得不到 大概是setState 的緣故
    return (
      initRouteData || {
        routeName: "",
        depName: "",
        desName: "",
      }
    );
  });
  //   const [routeName, setRouteName] = useState("");
  //   const [depName, setDepName] = useState("");
  //   const [desName, setDesName] = useState("");
  const [currentRender, setCurrentRender] = useState("Insearch");

  const { city } = useContext(CityContext);
  // 設置busDataProvider 可以順便把目的地等資料放進去傳遞

  // useEffect(() => {
  //     axios.get(API_URL, {
  //         headers: getAuthorizationHeader()
  //     }).then((response =>{
  //         setBusData(response.data)
  //     }))
  // }, [])

  useEffect(() => {
    localStorage.setItem("busData", JSON.stringify(busData));
  }, [busData]);

  useEffect(() => {
    localStorage.setItem("routeData", JSON.stringify(routeData));
  }, [routeData]);

const fetchData = useCallback(() => {
  async function getData() {
    try {
      let res = await apiBusCity(city);
      if (res.status === 200) {
        console.log(res.status);
      }
      setBusData(res.data);
    } catch (err) {
      console.error(err);
    }
  }
  getData();
},[city])

useEffect(() => {
  fetchData();
}, [fetchData]);


  return (
    <div className="container-fluid">
      <span>首頁 /</span>
      <div className="row">
        <div className="col-md-4">
          {currentRender === "Insearch" && (
            <Insearch
              busData={busData}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setRouteData={setRouteData}
              // setRouteName={setRouteName}
              // setDepName={setDepName}
              // setDesName={setDesName}
              setCurrentRender={setCurrentRender}
            />
          )}
          {currentRender === "ShowRoute" && (
            <ShowRoute
              city={city}
              routeData={routeData}
              // routeName={routeName}
              // depName={depName}
              // desName={desName}
              setCurrentRender={setCurrentRender}
            />
          )}
        </div>
        <div className="col-md-8 ">
          <Map />
        </div>
      </div>
    </div>
  );
};

export default Search;
