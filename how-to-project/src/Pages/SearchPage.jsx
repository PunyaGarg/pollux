import React ,{useState}from "react";
import BCards from "../Elements/BCards";
import Blogs from "../Elements/Blogs";
import Tech from "../Elements/Tech"
import ResearchPaper from "../Elements/ResearchPaper"
import { Typography } from "@mui/material";
import Box from '@mui/material/Box';
import useAuthState from "../Firebase/hooks";
import { collection, query, where ,onSnapshot,arrayUnion,arrayRemove,doc,updateDoc,addDoc} from "firebase/firestore";
import { auth, db } from "../Firebase/firebase";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Liked from "../Elements/Liked";
import Bookmarked from "../Elements/Bookmarked";
import Navbar from "../Elements/Navbar";
import Button from "@mui/material/Button";


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function SearchPage() {
  const {user}=useAuthState(auth);
  const[value,setValue] = useState(0);
  const [category, setCategory] = useState('Blog');
  const [searchInput, setSearchInput] = useState("");
  const [blogs,setBlogs]=useState([]);
  const [researchPaper, setResearchPaper] = useState([]);
  const [placementStories , setPlacementStories] = useState([]);
  
  const [updated, setUpdated] = useState('');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


 const searchBlog = async () => {
   const articleRef=collection(db,"Admin")

     var q;
     if(searchInput.length > 0){
       q = q=query(articleRef,where('status',"==",true),where('category',"==","Blogs"), where("tags", "array-contains" , searchInput.toLowerCase()));
     }
     else {
      q = query(articleRef,where('status',"==",true),where('category',"==","Blogs"));
     }

     console.log(q);
     onSnapshot(q,(snapshot)=>{
       const blog = snapshot.docs.map((doc)=>({
         id:doc.id,
         ...doc.data(),
       }));
       setBlogs(blog);
       console.log(blog);
    });
 };

 const searchResearchPaper = async () => {
  const articleRef=collection(db,"Admin")

    var q;
    if(searchInput.length > 0){
      q = q=query(articleRef,where('status',"==",true),where('category',"==","Research Paper"), where("tags", "array-contains" , searchInput.toLowerCase()));
    }
    else {
     q = query(articleRef,where('status',"==",true),where('category',"==","Research Paper"));
    }

    console.log(q);
    onSnapshot(q,(snapshot)=>{
      const research_paper = snapshot.docs.map((doc)=>({
        id:doc.id,
        ...doc.data(),
      }));
      setResearchPaper(research_paper);
      console.log(research_paper);
   });
};

const searchPlacementStories = async () => {
  const articleRef=collection(db,"Admin")

    var q;
    if(searchInput.length > 0){
      q = q=query(articleRef,where('status',"==",true),where('category',"==","Technical Stuff"), where("tags", "array-contains" , searchInput.toLowerCase()));
    }
    else {
     q = query(articleRef,where('status',"==",true),where('category',"==","Technical Stuff"));
    }

    console.log(q);
    onSnapshot(q,(snapshot)=>{
      const placement_stories = snapshot.docs.map((doc)=>({
        id:doc.id,
        ...doc.data(),
      }));
      setPlacementStories(placement_stories);
      console.log(placement_stories);
   });
};

 const handleKeyDown = (event) => {
   if (event.key === 'Enter') {
     setUpdated(searchInput);

     if(category==='Blog')
       searchBlog();
     else if(category==='ResearchPaper')
       searchResearchPaper();

      else searchPlacementStories();
   }
 };

  return (
    <>
      <Navbar/>

      <input
            class="search-bar searchpage"
            type="search"
            placeholder="Search blogs by name , field of study or author name"
            id="searchInput"
          onChange={(e)=>{setSearchInput(e.target.value);}}
          onKeyDown = {handleKeyDown}
          value={searchInput}
        ></input>

        {
          (category==='Blog')? <button class="search-icon" type="submit" onClick={searchBlog}><i class="fa-solid fa-magnifying-glass"></i></button>
                    : (category==='ResearchPaper') ? <button class="search-icon" type="submit" onClick={searchResearchPaper}><i class="fa-solid fa-magnifying-glass"></i></button>
                                                   : <button class="search-icon" type="submit" onClick={searchPlacementStories}><i class="fa-solid fa-magnifying-glass"></i></button>
        }
        


      <div style={{marginLeft: '5%', marginRight: '5%'}}>
        
<Box
    sx={{
        width: '100%',
        marginLeft:'2%',
      }}>
        
      <Box className="blogreseach" x={{ borderBottom: 1, borderColor: 'divider' 
                                }} >
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" textColor="white"
            indicatorColor="secondary"
            sx={{marginLeft:'20%' , color:"white" ,  marginTop:20 }}>
          <Tab sx={{marginRight:'3%' ,display: 'block', fontSize:22}} label="BLOGS" {...a11yProps(0)} onClick={()=> {setCategory('Blog')}}/>
          <Tab sx={{marginRight:'3%', display: 'block',fontSize:22}} label="RESEARCH PAPER"{...a11yProps(1)} onClick={()=> {setCategory('ResearchPaper')}}/>
          <Tab sx={{marginRight:'3%', display: 'block',fontSize:22}} label="PLACEMENT STORIES" {...a11yProps(2)} onClick={()=> {setCategory('PlacementStories')}}/>
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
          <Blogs articles={blogs} setArticles={setBlogs}/>
      </TabPanel>
      <TabPanel value={value} index={1}>
          <ResearchPaper articles={researchPaper} setArticles={setResearchPaper}/>
      </TabPanel>
      <TabPanel value={value} index={2}>
         <Tech articles={placementStories} setArticles={setPlacementStories}/>
      </TabPanel>
    </Box>
</div>

     
    </>
  );
}
export default SearchPage;