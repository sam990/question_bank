import React, { useState } from 'react';
import { TextField, Button, createMuiTheme, CircularProgress} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import './App.css';
import TagsInput from 'react-tagsinput';
import ProgressButton from 'react-progress-button';

import 'react-progress-button/react-progress-button.css';
import 'react-tagsinput/react-tagsinput.css' 


async function postQuestion(queryInput, topicInput, tagsInput) {
  const response = await fetch('http://localhost:3001/api/insert', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: queryInput,
      topic: topicInput,
      tags: tagsInput,
    }),
  });

  // console.log(response);
  if (response.status === 200) {
    return true;
  } else {
    throw new Error('Some error occurred');
  }
}

function InsertSection() {
  const [tags, setTags] = useState([]);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");

  const clickHander = () => {
    const response = postQuestion(query, topic, tags);
    response.then(v => {
      setTags([]);
      setQuery("");
      setTopic("");
    })
    .catch(v => {
      
    });
    return response;
  }

  return(
    <div className="InsertSection">
      <h2 className="HeadingInsert">Insert</h2>
      <TextField className="QueryInput" variant="outlined" multiline label="Query" value={query} onChange={(e) => { setQuery(e.target.value); }}/>
      <div className="Divider15px"/>
      <TextField className="QueryInput" variant="outlined" label="Topic" size="small" value={topic} onChange={(e) => { setTopic(e.target.value); }}/>
      <div className="Divider15px"/>
      <TagsInput value={tags} onChange={setTags}/>
      <div className="Divider15px"/>
      <ProgressButton
        type="submit"
        controlled={false}
        className="SubmitButton"
        style={{width : '15vw'}}
        onClick={clickHander}>
          <span style={{fontWeight: "bold", fontSize: "1em",}}>Insert</span>
      </ProgressButton>
      <div className="Divider15px"/>
    </div>
    );
}

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#ffffff',
      dark: '#ffffff',
    },
  }
});


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function search(keyword) {
  try {
    const response = await fetch(`http://localhost:3001/api/search?keyword=${keyword}`);
    // console.log(response);
    if (response.status === 200) {
      return await response.json();
    } else {
      return null;
    }
  } catch(e) {
    console.error(e);
    return null;
  }
}


function ResultTable(props) {
  const { data } = props;
  // console.log(data);
  if (data == null) {
    return null;
  }
  if (data.length == 0) {
    return (
      <span class="result-text">No questions matching criteria</span>
    );
  }
  return(
    <ol class="result-text">
      { data.map(val => {
        return(
          <li key={val._id}>
            <span>{val.query}</span>
          </li>
        );
      }) }
    </ol>
  )
}

function SearchResult(props) {
  const { loading, data } = props;
  // initially loading
  return(
    <div>
      { loading ? <CircularProgress/> : <ResultTable  data={data}/> }
    </div>
  );
}

function SearchSection() {
  const [keyword, setKeyword] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);


  return(
    <ThemeProvider theme={theme}>
      <div className="SearchSection">
        <h2 className="HeadingSearch">Search</h2>
        <div className="HorizontalControls">
          <TextField size="small" 
            placeholder="Keyword" 
            value={keyword} 
            onChange={(e) => { 
              setKeyword(e.target.value); 
              setButtonDisabled(e.target.value.length == 0) 
              }
            }
          />
          <div className="Divider15pxHoz"></div>
          <Button
            className="Button"
            variant="contained"
            color="primary"
            style={{ borderRadius: 25 }}  disabled={buttonDisabled}
            onClick={()=>{ 
              setLoading(true);
              search(keyword)
              .then(value => {
                setData(value);
                setLoading(false);
              });
            }}
            >Search
          </Button>
        </div>
        <div className="Divider15px"/>
        <SearchResult loading={loading} data={data}/>
      </div>
    </ThemeProvider>
  );
}
  
function App() {
  return(
    <div>
      <InsertSection/>
      <SearchSection/>
    </div>
  );
};

export default App;
